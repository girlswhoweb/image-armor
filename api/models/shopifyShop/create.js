// api/models/shopifyShop/actions/create.js
import { applyParams, save, preventCrossShopDataAccess } from "gadget-server";

export async function run({ params, record }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
}

export async function onSuccess({ record, api, logger }) {
  try {
    if (record.mantleApiToken) return;

    const shopId = String(record.id);
    const res = await fetch("https://appapi.heymantle.dev/customers/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MANTLE_API_KEY}`,
      },
      body: JSON.stringify({
        externalId: shopId,
        email: record.email || undefined,
        name: record.name || record.domain || `Shop ${shopId}`,
        metadata: { shopDomain: record.domain || undefined },
      }),
    });

    if (!res.ok) {
      logger.warn("Mantle identify failed (Shop create)", await res.text());
      return;
    }

    const data = await res.json();
    const customerApiToken =
      data?.customerApiToken || data?.token || data?.customer?.apiToken; // robust
    if (customerApiToken) {
      await api.shopifyShop.update(record.id, { mantleApiToken: customerApiToken });
    }
  } catch (e) {
    logger.error("Mantle identify error (Shop create)", e?.message || String(e));
  }
}

export const options = {
  actionType: "create",
  triggers: { shopify: {} },
};
