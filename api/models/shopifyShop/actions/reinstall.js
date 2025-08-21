import { transitionState, applyParams, preventCrossShopDataAccess, save, ActionOptions, ShopifyShopState, ReinstallShopifyShopActionContext } from "gadget-server";
import { identifyShop } from "../../../services/mantle";

export async function onSuccess({ record, api }) {
  await identifyShop({ shop: record, api });
}

/**
 * @param { ReinstallShopifyShopActionContext } context
 */
export async function run({ params, record, logger, api }) {
  transitionState(record, {from: ShopifyShopState.Uninstalled, to: ShopifyShopState.Installed});
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { ReinstallShopifyShopActionContext } context
 */
export async function onSuccess({ params, record, logger, api }) {
  const shopSettings = await api.shopSettings.maybeFindByShopUrl(record.myshopifyDomain)
  console.log("shopSettings", shopSettings);
  if(!shopSettings) {
    await api.shopSettings.create({
      _shopId: record.id.toString(),
      shop: {
        _link: record.id.toString()
      }
    })
  }
  await api.shopifySync.run({
    domain: record.myshopifyDomain,
    shop: {
      _link: record.id
    },
    syncSince: "1900-01-01T00:00:00.000+00:00"
  })
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: false },
};
