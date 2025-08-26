/// api/services/mantle.js
import { MantleClient } from "@heymantle/client";

export const mantleClient = new MantleClient({
  appId: process.env.GADGET_PUBLIC_MANTLE_APP_ID,
  apiKey: process.env.MANTLE_API_KEY,
});

/**
 * Identify the current shop with Mantle and persist mantleApiToken.
 * Returns { ok, reason?, error?, debug? } and never throws.
 */
export async function identifyShop({ shopId, api, logger }) {
  try {
    // 0) Basic env validation
    const missing = [];
    if (!process.env.GADGET_PUBLIC_MANTLE_APP_ID) missing.push("GADGET_PUBLIC_MANTLE_APP_ID");
    if (!process.env.MANTLE_API_KEY) missing.push("MANTLE_API_KEY");
    if (missing.length) {
      logger?.error?.("Mantle identify: missing env", { missing });
      return { ok: false, reason: "missing-env", debug: { missing } };
    }

    // 1) Get a fresh shop record including the access token
    const shop = await api.internal.shopifyShop.findOne(String(shopId), {
      select: {
        id: true,
        myshopifyDomain: true,
        name: true,
        email: true,
        accessToken: true,
      },
    });

    if (!shop) return { ok: false, reason: "no-shop" };
    if (!shop.accessToken) {
      logger?.error?.("Mantle identify: no accessToken", { shopId: String(shopId) });
      return { ok: false, reason: "no-access-token" };
    }

    // 2) Call Mantle identify (Enhanced identify requires accessToken)
    let res;
    try {
      res = await mantleClient.identify({
        platform: "shopify",
        platformId: String(shop.id),
        myshopifyDomain: shop.myshopifyDomain,
        accessToken: shop.accessToken,
        name: shop.name,
        email: shop.email,
      });
    } catch (e) {
      // Library errors (network, 4xx/5xx) end up here
      logger?.error?.("Mantle identify: client exception", {
        message: e?.message,
        stack: e?.stack,
      });
      return { ok: false, reason: "mantle-client-exception", error: e?.message };
    }

    const keys = Object.keys(res || {});
    const token = res?.apiToken || res?.customerApiToken || res?.token || null;
    if (!token) {
      logger?.error?.("Mantle identify: no token in response", { keys, res });
      return { ok: false, reason: "no-token", debug: { keys } };
    }

    // 3) Save token
    await api.shopifyShop.update(String(shop.id), { mantleApiToken: token });

    return { ok: true, debug: { keys } };
  } catch (e) {
    logger?.error?.("identifyShop exception", { message: e?.message, stack: e?.stack });
    return { ok: false, reason: "exception", error: e?.message };
  }
}




// // api/services/mantle.js
// import { MantleClient } from "@heymantle/client";

// export const mantleClient = new MantleClient({
//   appId: process.env.GADGET_PUBLIC_MANTLE_APP_ID,
//   apiKey: process.env.MANTLE_API_KEY,
// });

// /**
//  * Call this from your actions with { shopId, api, logger }.
//  * It re-fetches the shop via the internal API to get accessToken.
//  */
// export async function identifyShop({ shopId, api, logger }) {
//   // 1) Pull protected fields (accessToken!) via internal API
//   const shop = await api.internal.shopifyShop.findOne(shopId, {
//     select: { id: true, myshopifyDomain: true, name: true, email: true, accessToken: true },
//   });

//   if (!shop?.accessToken) {
//     logger?.error?.("Mantle identify: shop has no accessToken", { shopId: String(shopId) });
//     return;
//   }

//   logger?.info?.("Mantle identify: starting", { shopId: String(shopId), myshopifyDomain: shop.myshopifyDomain });

//   // 2) Enhanced identification — requires accessToken
//   const result = await mantleClient.identify({
//     platform: "shopify",
//     platformId: String(shop.id),
//     myshopifyDomain: shop.myshopifyDomain,
//     accessToken: shop.accessToken,
//     name: shop.name,
//     email: shop.email,
//   });

//   logger?.info?.("Mantle identify result (keys)", Object.keys(result || {})); // quick visibility

//   const token = result?.apiToken; // Mantle returns { apiToken } for the customer
//   if (!token) {
//     logger?.error?.("Mantle identify: no apiToken returned", result);
//     return;
//   }

//   // 3) Save flat (simplest & correct)
//   await api.shopifyShop.update(shop.id, { mantleApiToken: token });
//   logger?.info?.("Mantle identify: saved mantleApiToken", { shopId: String(shopId) });
// }
