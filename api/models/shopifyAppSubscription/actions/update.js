import { applyParams, preventCrossShopDataAccess, save, ActionOptions, UpdateShopifyAppSubscriptionActionContext } from "gadget-server";

/**
 * @param { UpdateShopifyAppSubscriptionActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/**
 * @param { UpdateShopifyAppSubscriptionActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // If all plans are cancelled, set isPaidUser to false
  const anyActivePlan = await api.shopifyAppSubscription.maybeFindFirst({
    filter:{
      status: {
        equals: "ACTIVE"
      }
    }
  });
  if(!anyActivePlan){
    const shopSettings = await api.shopSettings.findByShopId(record.shopId);
    if(shopSettings){
      await api.shopSettings.update(shopSettings.id, {
        isPaidUser: false
      });
    }
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: false },
};
