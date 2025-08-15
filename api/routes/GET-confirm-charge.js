/**
 * Route handler for GET /confirm-charge
 * Billing API (manual pricing): creates a charge and returns confirmationUrl.
 *
 * Accepts ?plan=starter|pro
 */
export default async function route({ request, reply, api, logger, connections }) {
  if (!connections.shopify.current) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  try {
    const plan = String(request.query?.plan ?? "starter").toLowerCase();

    // Find shop + build return URL back into your app
    const shopSettings = await api.shopSettings.findByShopId(
      connections.shopify.currentShopId.toString()
    );
    if (!shopSettings?.shopUrl) {
      return reply.status(400).send({ message: "Shop not found" });
    }
    const APP_HANDLE = process.env.APP_HANDLE || "imagearmor";
    const returnUrl = `https://${shopSettings.shopUrl}/admin/apps/${APP_HANDLE}`;

    // Use test charges in dev/review stores; set to "false" after approval
    const BILLING_TEST =
      (process.env.BILLING_TEST ?? "true").toLowerCase() === "true";

    if (plan === "pro") {
      // Recurring subscription: $14 every 30 days
      const planName = "Pro Plan";
      const price = 14.0;

      const result = await connections.shopify.current.graphql(
        `
          mutation AppSubscriptionCreate(
            $name: String!
            $returnUrl: URL!
            $test: Boolean!
          ) {
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
        `,
        { name: planName, returnUrl, test: BILLING_TEST }
      );

      const data = result?.appSubscriptionCreate;
      if (data?.userErrors?.length) {
        logger.error("Billing API errors (pro)", data.userErrors);
        return reply.status(400).send({ errors: data.userErrors });
      }
      return reply.send({ confirmationUrl: data?.confirmationUrl });
    }

    // Starter: one-time $1 charge
    const planName = "Starter Plan (One-time)";
    const price = 1.0;

    const result = await connections.shopify.current.graphql(
      `
        mutation appPurchaseOneTimeCreate(
          $name: String!
          $price: MoneyInput!
          $returnUrl: URL!
          $test: Boolean!
        ) {
          appPurchaseOneTimeCreate(
            name: $name,
            price: $price,
            returnUrl: $returnUrl,
            test: $test
          ) {
            userErrors { field message }
            confirmationUrl
            appPurchaseOneTime { id status }
          }
        }
      `,
      {
        name: planName,
        price: { amount: price, currencyCode: "USD" },
        returnUrl,
        test: BILLING_TEST,
      }
    );

    const data = result?.appPurchaseOneTimeCreate;
    if (data?.userErrors?.length) {
      logger.error("Billing API errors (starter)", data.userErrors);
      return reply.status(400).send({ errors: data.userErrors });
    }
    return reply.send({ confirmationUrl: data?.confirmationUrl });
  } catch (err) {
    logger?.error?.("confirm-charge error", err?.message || String(err));
    return reply.status(500).send({ message: "Internal error" });
  }
}
