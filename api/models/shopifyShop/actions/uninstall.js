import { transitionState, applyParams, preventCrossShopDataAccess, save, ActionOptions, ShopifyShopState, UninstallShopifyShopActionContext } from "gadget-server";

/**
 * @param { UninstallShopifyShopActionContext } context
 */
export async function run({ params, record, logger, api }) {
  transitionState(record, {from: ShopifyShopState.Installed, to: ShopifyShopState.Uninstalled});
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { UninstallShopifyShopActionContext } context
 */
export async function onSuccess({ params, record, logger, api }) {
  // Your logic goes here
  const shopSettings = await api.shopSettings.findByShopUrl(record.myshopifyDomain);
  if(shopSettings) {
    await api.shopSettings.update(shopSettings.id, {
      isPaidUser: false,
    })
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: false },
};
