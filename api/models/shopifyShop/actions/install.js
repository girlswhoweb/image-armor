import { transitionState, applyParams, save, ActionOptions, ShopifyShopState, InstallShopifyShopActionContext } from "gadget-server";

/**
 * @param { InstallShopifyShopActionContext } context
 */
export async function run({ params, record, logger, api }) {
  transitionState(record, {to: ShopifyShopState.Installed});
  applyParams(params, record);
  await save(record);
};

/**
 * @param { InstallShopifyShopActionContext } context
 */
export async function onSuccess({ params, record, logger, api }) {
  // Check if shopSettings exists, update if exists else create
  const shopSettings = await api.shopSettings.maybeFindByShopUrl(record.myshopifyDomain);

  if(!shopSettings) {
    await api.shopSettings.create({
      _shopId: record.id,
      shopUrl: record.myshopifyDomain,
      shop: {
        _link: record.id
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
  actionType: "create",
  triggers: { api: false },
};
