import { GlobalActionContext } from "gadget-server";

/**
 * @param { GlobalActionContext } context
 */
export async function run({ params, api, logger }) {
  const shopId = params?.shopId || null;
  let updatedShops = [];

  // Get all shops with active starter plan
  const filter = { starterPlanUser: { equals: true } };
  if (shopId) filter._shopId = { equals: shopId };

  const shops = await api.shopSettings.findMany({
    filter,
    first: 250,
  });

  for (const shop of shops) {
    if (!shop.starterPlanStartDate) continue;

    const start = new Date(shop.starterPlanStartDate);
    const now = new Date();
    const diffDays = (now - start) / (1000 * 60 * 60 * 24);

    if (diffDays > 7) {
      await api.shopSettings.update(shop.id, {
        starterPlanUser: false,
        isPaidUser: false,
      });
      logger.info(`Expired starter plan for ${shop.shopUrl}`);
      updatedShops.push(shop.shopUrl);
    }
  }

  if (updatedShops.length === 0) {
    logger.info("No starter plans expired.");
    return { updated: 0, shops: [] };
  }

  return { updated: updatedShops.length, shops: updatedShops };
}

export const options = {
  triggers: {
    scheduler: [{ every: "day", at: "00:05 UTC" }],
  },
};
