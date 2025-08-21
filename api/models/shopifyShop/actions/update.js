import { applyParams, preventCrossShopDataAccess, save, ActionOptions, UpdateShopifyShopActionContext } from "gadget-server";
import { identifyShop } from "../../../services/mantle";

export async function onSuccess({ record, api }) {
  await identifyShop({ shop: record, api });
}

/**
 * @param { UpdateShopifyShopActionContext } context
 */
export async function run({ params, record, logger, api }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { UpdateShopifyShopActionContext } context
 */
export async function onSuccess({ params, record, logger, api }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: false },
};
