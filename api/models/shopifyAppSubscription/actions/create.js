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
export async function onSuccess({ record, api }) {
  if (record.status === "ACTIVE") {
    const shopSettings = await api.shopSettings.findByShopId(record.shopId);
    if (!shopSettings) return;

    if (shopSettings) {
      await api.shopSettings.update(shopSettings.id, {
        isPaidUser: true,
        starterPlanUser: false
      });
    }
  }
}

// export async function onSuccess({ record, api }) {
//   if (record.status === "ACTIVE") {
//     const shopSettings = await api.shopSettings.findByShopId(record.shopId);
//     if (!shopSettings) return;

//     const name = record.name.toLowerCase();

//     if (name.includes("pro")) {
//       await api.shopSettings.update(shopSettings.id, {
//         isPaidUser: true,
//         starterPlanUser: false
//       });
//     }
//   }
// }


/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { shopify: {} },
};

