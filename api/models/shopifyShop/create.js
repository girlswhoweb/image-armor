import { applyParams, save, ActionOptions, CreateShopifyShopActionContext } from "gadget-server";

/**
 * @param { CreateShopifyShopActionContext } context
 */
export async function run({ params, record, logger, api }) {
  // transitionState(record, { to: ShopifyShopState.Installed });
  // record.accessToken = params.accessToken;
  applyParams(params, record);
  await save(record);
};

/**
 * @param { CreateShopifyShopActionContext } context
 */
export async function onSuccess({ params, record, logger, api }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create"
};
