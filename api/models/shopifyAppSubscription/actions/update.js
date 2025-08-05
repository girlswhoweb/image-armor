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
export async function onSuccess({ record, api }) {
  const anyActivePlan = await api.shopifyAppSubscription.maybeFindFirst({
    filter: { status: { equals: "ACTIVE" } }
  });

  const shopSettings = await api.shopSettings.findByShopId(record.shopId);
  if (!shopSettings) return;

  if (!anyActivePlan) {
    await api.shopSettings.update(shopSettings.id, {
      isPaidUser: false,
      starterPlanUser: false
    });
  }
}


/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: false },
};
