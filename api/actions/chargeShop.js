import { ChargeShopGlobalActionContext } from "gadget-server";

/**
 * @param { ChargeShopGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  // Get all the active subscriptions
  
  /** @type {import("@gadget-client/imagearmor").ShopifyAppSubscription[]} */ 
  let subscriptions = [];
  async function getSubscriptions({ cursor, filter }) {
    let localSubscriptions = await api.shopifyAppSubscription.findMany({
      first: 250,
      filter: filter || {},
      after: cursor || "",
      select: {
        id: true,
        shopId: true,
        currentPeriodEnd: true,
        status: true,
        name: true,
      }
    });
    subscriptions = subscriptions.concat(localSubscriptions);
    if (localSubscriptions.hasNextPage) {
      await getSubscriptions({
        cursor: localSubscriptions.endCursor,
        filter: filter || {},
      });
    }
  }

  await getSubscriptions({ filter: {
    status: { equals: "ACTIVE" },
    name: { equals: "App Charge" }
  }})

  console.log("subscriptions", subscriptions.length);
  
  
  for (let subscription of subscriptions) {
    try{
      // Find the shopify shop related to the subscription
      const shopifyShop = await api.shopifyShop.maybeFindOne(subscription.shopId)
      const markedImagesCount = shopifyShop.markedImagesCount;

      console.log("MarkedImagesCount", shopifyShop.myshopifyDomain, markedImagesCount);
      

      // Free up the first 50 images
      if(markedImagesCount > 50) {
        // Find the number of units to charge in total
        const chargeUnit = Math.ceil(markedImagesCount / 10000);

        console.log("chargeUnit", shopifyShop.myshopifyDomain, chargeUnit);

        // Check how many units charged in the billing period
        const endDate = new Date(subscription.currentPeriodEnd);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        // const chargesThisMonth = await api.shopifyAppUsageRecord.findMany({
        //   filter: {
        //     shopId: { equals: shopifyShop.id },
        //     createdAt: {
        //       greaterThanOrEqual: startDate,
        //       lessThanOrEqual: endDate,
        //     }
        //   }
        // })
        const shopify = await connections.shopify.forShopId(shopifyShop.id);
        const chargesThisMonth = await getAppliedCharges(shopify, startDate, endDate);
        const totalChargedPrice = chargesThisMonth.reduce((acc, cur) => {
          return acc + parseFloat(cur.price.amount);
        }, 0);
        const totalChargedUnits = totalChargedPrice / 5;

        console.log("totalChargedUnits", shopifyShop.myshopifyDomain, totalChargedUnits);

        // If not charged enough, charge the difference
        if(chargeUnit > totalChargedUnits && totalChargedUnits < 20) {
          console.log("Charging for", shopifyShop.myshopifyDomain, chargeUnit - totalChargedUnits);
          const chargeId = `gid://shopify/AppSubscriptionLineItem/${subscription.id}?v=1&index=0`;
          const unitsToCharge = chargeUnit - totalChargedUnits;
          const amount = unitsToCharge * 5;
          await createCharge(chargeId, amount, shopify, unitsToCharge, startDate, endDate);
          // console.log("Charge created for:", shopifyShop.myshopifyDomain, amount);
          console.log("Can create charge for:", shopifyShop.myshopifyDomain, amount);
        }
        // console.log("chargesThisMonth", chargesThisMonth);
      }
    } catch(e) {
      console.log("Error at ", subscription.shopId, e);
    }
  };

  async function getAppliedCharges(shopify, startDate, endDate) {
    const response = await shopify.graphql((`#graphql
      query getAppCharges{
        currentAppInstallation {
          activeSubscriptions{
            id
            createdAt
            lineItems{
              id
              usageRecords(first: 250){
                nodes{
                  id
                  price{
                    amount
                    currencyCode
                  }
                  createdAt
                }
              }
            }
          }
        }
      }
    `), {});

    console.log("response", response);
    
    
    // Flatten the nested arrays and filter by date
    const allUsageRecords = [];
    
    response.currentAppInstallation.activeSubscriptions.forEach(subscription => {
      subscription.lineItems.forEach(lineItem => {
        const filteredRecords = lineItem.usageRecords.nodes.filter(record => {
          const recordDate = new Date(record.createdAt);
          return recordDate >= startDate && recordDate <= endDate;
        });
        allUsageRecords.push(...filteredRecords);
      });
    });
    
    return allUsageRecords;
  }

  async function createCharge(chargeId, amount, shopify, unitsToCharge, startDate, endDate) {
    // Calculate how many thousand images this charge is for
    const thousandImages = unitsToCharge * 10;
    
    // Create a more accurate description
    const description = `Charge for ${thousandImages},000 watermarked images (${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()})`;

    const response = await shopify.graphql((`#graphql
      mutation appUsageRecordCreate($description: String!, $price: MoneyInput!, $subscriptionLineItemId: ID!) {
        appUsageRecordCreate(description: $description, price: $price, subscriptionLineItemId: $subscriptionLineItemId) {
          userErrors {
            field
            message
          }
          appUsageRecord {
            id
          }
        }
      }
    `), {
      "subscriptionLineItemId": chargeId,
      "price": {
        "amount": amount,
        "currencyCode": "USD"
      },
      "description": description
    });
    console.log("response", response);
    console.log("errors", response.appUsageRecordCreate.userErrors);
  }

  return "ok"
}

export const options = {
  triggers: {
    scheduler: [
      { every: "day", at: "00:01 UTC" },
    ],
  },
}