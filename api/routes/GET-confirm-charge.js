import { RouteContext } from "gadget-server";

/**
 * Route handler for GET hello
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */
export default async function route({
  request,
  reply,
  api,
  logger,
  connections,
}) {
  if (typeof connections.shopify.current === "undefined") {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const shopify = connections.shopify.current;
  const shopSettings = await api.shopSettings.findByShopId(connections.shopify.currentShopId.toString());
  // const returnUrl = `https://${shopSettings.shopUrl}/admin/apps/imagearmor-dev`
  const returnUrl = `https://${shopSettings.shopUrl}/admin/apps/imagearmor`

  // const { returnUrl } = request.query;

  // const shop = await shopify.shop.get();
  // const returnUrl = shop.myshopify_domain;

  // console.log("returnUrl", returnUrl);

  // const chargeId = "gid://shopify/AppSubscriptionLineItem/28868477149?v=1&index=0"

  // const response = await shopify.graphql((`
  //   mutation appUsageRecordCreate($description: String!, $price: MoneyInput!, $subscriptionLineItemId: ID!) {
  //     appUsageRecordCreate(description: $description, price: $price, subscriptionLineItemId: $subscriptionLineItemId) {
  //       userErrors {
  //         field
  //         message
  //       }
  //       appUsageRecord {
  //         id
  //       }
  //     }
  //   }
  // `), {
  //   "subscriptionLineItemId": chargeId,
  //   "price": {
  //     "amount": 20,
  //     "currencyCode": "USD"
  //   },
  //   "description": "Super Mega Plan 1000 emails"
  // });
  // console.log("response", response);
  // return

  const chargeResponse = await shopify.graphql((`
    mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean!) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
        confirmationUrl
      }
    }
  `),
    {
      name: "App Charge",
      returnUrl: returnUrl,
      lineItems: [
        {
          plan: {
            appUsagePricingDetails: {
              cappedAmount: {
                amount: 100,
                currencyCode: "USD",
              },
              terms: "$5.99 / month for new customers with less than 10,000 images, $5 / month for every 10,000 images thereafter",
            },
          },
        },
      ],
      test: false,
    }
  );

  console.log("chargeResponse", chargeResponse);

  await reply.send(chargeResponse);
}
