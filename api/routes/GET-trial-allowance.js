export default async function route({ request, reply, api, connections, logger }) {
  try {
    if (!connections.shopify.current) {
      return reply.status(401).send({ ok: false, message: "Unauthorized" });
    }

    const DAY_MS = 86400000;
    const shopId = connections.shopify.currentShopId.toString();
    const shopSettings = await api.shopSettings.findByShopId(shopId);
    if (!shopSettings) return reply.status(404).send({ ok: false, message: "Shop not found" });

    const paidDB = !!shopSettings.isPaidUser;
    const trialEverStarted = !!shopSettings.trialEverStarted;
    const trialEndsAtMs = shopSettings.trialEndsAt ? new Date(shopSettings.trialEndsAt).getTime() : 0;
    const now = Date.now();

    let inTrial = trialEverStarted && now < trialEndsAtMs; // DB is the source of truth once started
    let isPaidLive = paidDB;

    try {
      const q = await connections.shopify.current.graphql(`
        query {
          currentAppInstallation {
            activeSubscriptions { id status trialDays createdAt }
          }
        }
      `);
      const subs = q?.currentAppInstallation?.activeSubscriptions ?? [];
      const active = subs
        .filter(s => s.status === "ACTIVE")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      if (active) {
        const td = Number(active.trialDays || 0);

        if (!trialEverStarted && td > 0) {
          // First-ever trial → lock it in your DB
          const lockedEnds = new Date(active.createdAt).getTime() + td * DAY_MS;
          inTrial = now < lockedEnds;
          isPaidLive = !inTrial; // paid only after trial finishes

          await api.shopSettings.update(shopSettings.id, {
            trialEverStarted: true,
            trialEndsAt: new Date(lockedEnds)
          });
        } else if (td > 0 && trialEverStarted) {
          // They’re trying to start another trial; ignore Shopify’s new dates.
          inTrial = now < trialEndsAtMs;      // stick to your first trial window
          isPaidLive = !inTrial;              // still not paid while within that window
        } else {
          // No-trial plan
          inTrial = false;
          isPaidLive = true;
        }
      } else {
        // No active sub
        isPaidLive = false;
        // inTrial already determined from DB; if trialEverStarted and still before trialEndsAt we keep it, else false
      }
    } catch (e) {
      logger?.warn?.("activeSubscriptions failed; falling back to DB flags", e?.message || String(e));
      // keep inTrial from DB; keep isPaidLive from DB
    }

    // Trial cap math (only while truly in-trial)
    const TRIAL_CAP = 50;
    const used = Number(shopSettings.markedImagesCount || 0);
    const remaining = inTrial ? Math.max(0, TRIAL_CAP - used) : Number.POSITIVE_INFINITY;

    // Persist changes only if they changed
    const updates = {};
    if (shopSettings.isPaidUser !== isPaidLive) updates.isPaidUser = isPaidLive;
    if (isPaidLive && shopSettings.processStatus?.state === "LIMITED") {
      updates.processStatus = { ...shopSettings.processStatus, state: "IDEL", updatedAt: new Date() };
    }
    if (Object.keys(updates).length) {
      await api.shopSettings.update(shopSettings.id, updates);
    }

    return reply.send({
      ok: true,
      inTrial,
      cap: TRIAL_CAP,
      used,
      remaining,
      isPaidUser: isPaidLive,
      // optional: surface your DB view for debugging
      trialEverStarted,
      trialEndsAt: shopSettings.trialEndsAt ?? null
    });
  } catch (e) {
    logger.error("trial-allowance error", e?.message || String(e));
    return reply.status(500).send({ ok: false, message: "Internal error" });
  }
}




// // api/routes/GET-trial-allowance.js (or your existing route)
// export default async function route({ request, reply, api, connections, logger }) {
//   try {
//     if (!connections.shopify.current) {
//       return reply.status(401).send({ ok: false, message: "Unauthorized" });
//     }

//     const shopId = connections.shopify.currentShopId.toString();
//     const shopSettings = await api.shopSettings.findByShopId(shopId);
//     if (!shopSettings) return reply.status(404).send({ ok: false, message: "Shop not found" });

//     // ----- Read Shopify active subs
//     // const q = await connections.shopify.current.graphql(`
//     //   query {
//     //     currentAppInstallation {
//     //       activeSubscriptions {
//     //         id
//     //         status
//     //         trialDays
//     //         createdAt
//     //       }
//     //     }
//     //   }
//     // `);

//     // const subs = q?.currentAppInstallation?.activeSubscriptions ?? [];

//     // // In-trial if any ACTIVE sub still within its trial window
//     // const now = Date.now();
//     // const anyInTrial = subs.some(s => {
//     //   const td = Number(s.trialDays || 0);
//     //   if (td <= 0) return false;
//     //   const end = new Date(s.createdAt).getTime() + td * 24 * 60 * 60 * 1000;
//     //   return now < end;
//     // });

//     // // Paid if any ACTIVE sub with NO trial OR trial ended
//     // const isPaidLive = subs.some(s => {
//     //   if (s.status !== "ACTIVE") return false;
//     //   const td = Number(s.trialDays || 0);
//     //   if (td === 0) return true;                // no-trial plan
//     //   const end = new Date(s.createdAt).getTime() + td * 24 * 60 * 60 * 1000;
//     //   return now >= end;                        // trial elapsed
//     // });
//     // Source of truth: Mantle / your DB flag
//     const isPaidLive = !!shopSettings.isPaidUser;
//     // Determine trial *only* if not paid. If paid, no trial.
//     let anyInTrial = false;
//     if (!isPaidLive) {
//       try {
//         const q = await connections.shopify.current.graphql(`
//           query {
//             currentAppInstallation {
//               activeSubscriptions { id status trialDays createdAt }
//             }
//           }
//         `);
//         const subs = q?.currentAppInstallation?.activeSubscriptions ?? [];
//         const now = Date.now();
//         anyInTrial = subs.some(s => {
//           const td = Number(s.trialDays || 0);
//           if (td <= 0) return false;
//           const end = new Date(s.createdAt).getTime() + td * 86400000;
//           return now < end;
//         });
//       } catch (e) {
//         // If you bill via Mantle, assume not in trial on failure.
//         logger.warn("Shopify activeSubscriptions failed; assuming not in trial", e?.message || String(e));
//         anyInTrial = false;
//       }
//     }

//     // Trial cap math
//     const TRIAL_CAP = 50;
//     const used = Number(shopSettings.markedImagesCount || 0);
//     // const inTrial = anyInTrial; // keep cap ONLY while actually in trial
//     const inTrial = isPaidLive ? false : anyInTrial; // paid => no trial cap
//     const remaining = inTrial ? Math.max(0, TRIAL_CAP - used) : Number.POSITIVE_INFINITY;

//     // Persist flags + clear LIMITED if we’re paid now
//     // const updates = { isPaidUser: isPaidLive };
//     // Optionally clear LIMITED if we’re paid now
//     const updates = {};
//     if (isPaidLive && shopSettings.processStatus?.state === "LIMITED") {
//       updates.processStatus = {
//         ...shopSettings.processStatus,
//         state: "IDEL",
//         updatedAt: new Date()
//       };
//     }
//     if (Object.keys(updates).length) {
//       await api.shopSettings.update(shopSettings.id, updates);
//     }

//     return reply.send({
//       ok: true,
//       inTrial,
//       cap: TRIAL_CAP,
//       used,
//       remaining,
//       isPaidUser: isPaidLive
//     });
//   } catch (e) {
//     logger.error("trial-allowance error", e?.message || String(e));
//     return reply.status(500).send({ ok: false, message: "Internal error" });
//   }
// }
