// Cancels the current app's active Shopify subscription(s) for this shop
export default async function route({ request, reply, connections, api, logger }) {
  try {
    if (!connections.shopify.current) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    // Get active subs for THIS app installation
    const q = await connections.shopify.current.graphql(`
      query {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
          }
        }
      }
    `);

    const subs = q?.currentAppInstallation?.activeSubscriptions || [];
    if (!subs.length) return reply.send({ ok: true, cancelled: 0 });

    let cancelled = 0;
    for (const sub of subs) {
      // Cancel immediately
      const r = await connections.shopify.current.graphql(
        `
          mutation appSubscriptionCancel($id: ID!) {
            appSubscriptionCancel(id: $id) {
              userErrors { field message }
              appSubscription { id status }
            }
          }
        `,
        { id: sub.id }
      );

      const err = r?.appSubscriptionCancel?.userErrors?.[0];
      if (err) {
        logger.error("Cancel failed", { subId: sub.id, err });
        continue;
      }
      cancelled++;
    }

    // Optional: flip your local flags so UI gates features right away
    const shopSettings = await api.shopSettings.findByShopId(
      connections.shopify.currentShopId.toString()
    );
    if (shopSettings) {
      await api.shopSettings.update(shopSettings.id, {
        isPaidUser: false,
      });
    }

    return reply.send({ ok: true, cancelled });
  } catch (e) {
    logger.error("billing-cancel error", e?.message || String(e));
    return reply.status(500).send({ message: "Internal error" });
  }
}
