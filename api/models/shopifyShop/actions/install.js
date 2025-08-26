// api/models/shopifyShop/actions/install.js
import { transitionState, applyParams, save, ActionOptions, ShopifyShopState } from "gadget-server";
import { identifyShop } from "../../../services/mantle.js";

export async function run({ params, record }) {
  transitionState(record, { to: ShopifyShopState.Installed });
  applyParams(params, record);
  await save(record);
}

export async function onSuccess({ record, api, logger }) {
  // 1) Identify to Mantle (saves mantleApiToken)
  try {
    // await identifyShop({ shop: record, api, logger });
    await identifyShop({ shopId: record.id, api, logger });
  } catch (e) {
    logger.error("Mantle identify (install) failed", e?.message || String(e));
  }

  // 2) Your existing post-install init (shopSettings, sync, etc)
  try {
    const shopSettings = await api.shopSettings.maybeFindByShopUrl(record.myshopifyDomain);
    if (!shopSettings) {
      await api.shopSettings.create({
        _shopId: record.id,
        shopUrl: record.myshopifyDomain,
        shop: { _link: record.id }
      });
    }
    await api.shopifySync.run({
      domain: record.myshopifyDomain,
      shop: { _link: record.id },
      syncSince: "1900-01-01T00:00:00.000+00:00"
    });
  } catch (e) {
    logger.error("Post-install init failed", e?.message || String(e));
  }
}

export const options = { actionType: "create", triggers: { api: false } };
