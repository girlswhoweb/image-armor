// API/services/mantle.js
import { MantleClient } from "@heymantle/client";

export const mantleClient = new MantleClient({
  appId: process.env.GADGET_PUBLIC_MANTLE_APP_ID,
  apiKey: process.env.MANTLE_API_KEY,
});

export async function identifyShop({ shop, api }) {
  const { id, name, email, myshopifyDomain, accessToken } = shop;
  const result = await mantleClient.identify({
    platform: "shopify",
    platformId: id,
    myshopifyDomain,
    accessToken,
    name,
    email,
  });
  await api.internal.shopifyShop.update(shop.id, {
    shopifyShop: { mantleApiToken: result.apiToken },
  });
}
