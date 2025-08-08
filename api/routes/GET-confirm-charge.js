/**
 * Route handler for GET /confirm-charge
 *
 * Accepts query param `plan=starter` or `plan=pro`.
 */
export default async function route({ request, reply, api, logger, connections }) {
  if (!connections.shopify.current) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const plan = (request.query.plan || "starter").toLowerCase();
  const shopSettings = await api.shopSettings.findByShopId(
    connections.shopify.currentShopId.toString()
  );

  // Return URL for Shopify to redirect after approving the charge
  const returnUrl = `https://${shopSettings.shopUrl}/admin/apps/imagearmor`;

  // Plan logic
  if (plan === "pro") {
    // Pro Plan -> Recurring subscription
    const planName = "Pro Plan";
    const price = 14.0;

    const chargeResponse = await connections.shopify.current.graphql(`
      mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $test: Boolean!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          lineItems: [{
            plan: {
              appRecurringPricingDetails: {
                price: { amount: ${price}, currencyCode: USD }
                interval: EVERY_30_DAYS
              }
            }
          }]
          test: $test
        ) {
          userErrors { field message }
          appSubscription { id name status }
          confirmationUrl
        }
      }
    `, {
      name: planName,
      returnUrl,
      test: true, // to test payments
    });

    const data = chargeResponse.appSubscriptionCreate;
    if (data.userErrors && data.userErrors.length > 0) {
      logger.error("Pro subscription errors", data.userErrors);
      return reply.status(400).send({ errors: data.userErrors });
    }

    const confirmationUrl = data.confirmationUrl;
    logger.info(`Created ${planName} for shop ${shopSettings.shopUrl}: ${confirmationUrl}`);
    return reply.send({ confirmationUrl });

  } else {
    // Starter Plan -> One-time $1 charge
    const planName = "Starter Plan (One-time)";
    const price = 1.0;

    const chargeResponse = await connections.shopify.current.graphql(`
      mutation appPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!) {
        appPurchaseOneTimeCreate(name: $name, price: $price, returnUrl: $returnUrl, test: true) {
          userErrors { field message }
          confirmationUrl
          appPurchaseOneTime { id status }
        }
      }
    `, {
      name: planName,
      price: { amount: price, currencyCode: "USD" },
      returnUrl,
    });

    const data = chargeResponse.appPurchaseOneTimeCreate;
    if (data.userErrors && data.userErrors.length > 0) {
      logger.error("Starter plan errors", data.userErrors);
      return reply.status(400).send({ errors: data.userErrors });
    }

    const confirmationUrl = data.confirmationUrl;
    logger.info(`Created ${planName} for shop ${shopSettings.shopUrl}: ${confirmationUrl}`);
    return reply.send({ confirmationUrl });
  }
}
