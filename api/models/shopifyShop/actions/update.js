// api/models/shopifyShop/actions/update.js
import { applyParams, save, preventCrossShopDataAccess } from "gadget-server";
import { identifyShop } from "../../../services/mantle.js";

export async function run({ params, record }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
}

export async function onSuccess({ record, api, logger }) {
  try {
    if (!record.mantleApiToken) {
      await identifyShop({ shopId: record.id, api, logger });
    }
  } catch (e) {
    logger.error("Mantle identify (update) failed", e?.message || String(e));
  }
}

export const options = { actionType: "update", triggers: { shopify: {}, api: true    } };
