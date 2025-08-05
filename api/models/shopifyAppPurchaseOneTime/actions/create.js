import { applyParams, save, ActionOptions, CreateShopifyAppPurchaseOneTimeActionContext } from "gadget-server";

export async function run({ params, record }) {
  applyParams(params, record);
  await save(record);
}

export async function onSuccess({ record, api }) {
  // Only act on successful charges
  if (record.status?.toUpperCase() === "ACCEPTED") {
    const shopSettings = await api.shopSettings.findByShopId(record.shopId);
    if (!shopSettings) return;

    // Mark starter plan active and record start date
    await api.shopSettings.update(shopSettings.id, {
      starterPlanUser: true,
      isPaidUser: false,
      starterPlanStartDate: new Date(),
    });
  }
}

export const options = {
  actionType: "create",
  triggers: { api: false },
};
