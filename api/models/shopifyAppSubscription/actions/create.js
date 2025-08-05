import { applyParams, preventCrossShopDataAccess, save, ActionOptions, CreateShopifyAppSubscriptionActionContext } from "gadget-server";

/**
 * @param { CreateShopifyAppSubscriptionActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { CreateShopifyAppSubscriptionActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  if(record.status === "ACTIVE"){
    const shopSettings = await api.shopSettings.findByShopId(record.shopId);
    if(shopSettings){
      await api.shopSettings.update(shopSettings.id, {
        isPaidUser: true
      });
    }
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: false },
};
