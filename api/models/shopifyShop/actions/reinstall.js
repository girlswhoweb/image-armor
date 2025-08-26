// api/models/shopifyShop/actions/reinstall.js
import { transitionState, applyParams, preventCrossShopDataAccess, save, ActionOptions, ShopifyShopState } from "gadget-server";
import { identifyShop } from "../../../services/mantle.js";

export async function run({ params, record }) {
  transitionState(record, { from: ShopifyShopState.Uninstalled, to: ShopifyShopState.Installed });
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
}

export async function onSuccess({ record, api, logger }) {
  try {
    // await identifyShop({ shop: record, api, logger });
    await identifyShop({ shopId: record.id, api, logger });
  } catch (e) {
    logger.error("Mantle identify (reinstall) failed", e?.message || String(e));
  }

  try {
    let shopSettings = await api.shopSettings.maybeFindByShopUrl(record.myshopifyDomain);
    if (!shopSettings) {
      await api.shopSettings.create({ _shopId: record.id, shop: { _link: record.id } });
    }
    await api.shopifySync.run({
      domain: record.myshopifyDomain,
      shop: { _link: record.id },
      syncSince: "1900-01-01T00:00:00.000+00:00"
    });
  } catch (e) {
    logger.error("Reinstall init failed", e?.message || String(e));
  }
}

export const options = { actionType: "update", triggers: { api: false } };
