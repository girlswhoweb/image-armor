import {
  applyParams,
  save,
  ActionOptions,
  UpdateShopSettingsActionContext,
} from "gadget-server";
import { bulkQuery, bulkQueryByCollection, bulkQueryById } from "../../../../utils/bulkFunctions";
import { v4 as uuidv4 } from "uuid";
import { Lambda } from "@aws-sdk/client-lambda";

/**
 * @param { UpdateShopSettingsActionContext } context
 */
export async function run({ params, record, logger, api }) {
  applyParams(params, record);
  await save(record);
}

function getProductCount(planName){
  const min = parseInt(planName.split("-")[1], 10)
  const max = parseInt(planName.split("-")[2], 10)
  return {min, max};
}

/**
 * @param { UpdateShopSettingsActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  if (typeof params.shopSettings?.isActive !== "undefined") {
    if (params.shopSettings?.isActive === true) {
      const shopify = connections.shopify.current;

      // ==== Get the product conunt ====
      // const accessToken = await api.internal.shopifyShop.findOne(record.shopId).then((res) => res.getField("accessToken"))
      // const url = "https://" + record.shopUrl + "/admin/api/2024-01/products/count.json"
      // const productCount = await fetch(url, {
      //   method: "GET",
      //   headers: {
      //     "X-Shopify-Access-Token": accessToken
      //   }
      // }).then((res) => res.json())

      // console.log("productCount", productCount);

      // ==== Get the shop plan ====
      // const shopPlan = await api.shopifyAppSubscription.maybeFindFirst({
      //   filter: {
      //     status: {
      //       equals: "ACTIVE"
      //     }
      //   }
      // }).catch((err) => {
      //   console.log("err", err);
      //   return null;
      // })

      // ==== Create App Subscription ====
      // let applyCharge = false
      // let chargePlan = {}

      // if(shopPlan){
      //   const {min, max} = getProductCount(shopPlan.name);
      //   if(productCount.count <= max){
      //     applyCharge = false
      //   } else {
      //     applyCharge = true
      //   }
      // } else {
      //   applyCharge = true
      // }
      // if(applyCharge){
      //   const returnUrl = `https://${record.shopUrl}/admin/apps/101788b0d255dbcf49ca90c5e287672a`
      //   // const returnUrl = `https://${record.shopUrl}/admin/apps/972199c6b463888b97627ccc2112a626`
      //   const CREATE_SUBSCRIPTION_QUERY = `
      //     mutation CreateSubscription($name: String!, $price: Decimal!) {
      //       appSubscriptionCreate(
      //         name: $name,
      //         test: false,
      //         returnUrl: "${returnUrl}",
      //         lineItems: [{
      //           plan: {
      //             appRecurringPricingDetails: {
      //               price: { amount: $price, currencyCode: USD }
      //               interval: EVERY_30_DAYS
      //             }
      //           }
      //         }]
      //       ) {
      //         userErrors {
      //           field
      //           message
      //         }
      //         confirmationUrl
      //         appSubscription {
      //           id
      //         }
      //       }
      //     }
      //   `;

      //   // Identify the plan to charge based on the product count
      //   SHOPIFY_PLANS.forEach((plan) => {
      //     const {min, max} = getProductCount(plan.name);
      //     if(productCount.count >= min && productCount.count <= max){
      //       chargePlan = {
      //         name: plan.name,
      //         price: plan.price
      //       }
      //     }
      //   })
      //   const result = await shopify.graphql(CREATE_SUBSCRIPTION_QUERY, chargePlan);
      
      //   const { confirmationUrl, appSubscription } = result.appSubscriptionCreate;
      //   await api.shopSettings.update(record.id, {
      //     processStatus: {
      //       state: "CHARGE",
      //       confirmationUrl
      //     }
      //   })
      //   return
      // }

      // ==== Start with the bulk watermark ====
      // Run a bulk query to get all the product media based on the settings
      const activeSettings = params.shopSettings.activeData;
      const featuredOnly = activeSettings.featuredOnly;
      // const shopify = connections.shopify.current;
      let queryStr = ""
      if(activeSettings.radioValue === "selectedProducts"){
        const productIdList = activeSettings.selectedProducts.map((productId) => productId.id.replace("gid://shopify/Product/", ""))
        queryStr = bulkQueryById(productIdList);
      } else if(activeSettings.radioValue === "selectedCollections"){
        const collectionIdList = activeSettings.selectedCollections.map((collectionId) => collectionId.id.replace("gid://shopify/Collection/", ""))
        queryStr = bulkQueryByCollection(collectionIdList);
      } else {
        queryStr = bulkQuery()
      }
      shopify.graphql((`
        mutation bulkQuery($queryStr: String!){
          bulkOperationRunQuery(
            query: $queryStr
          ) {
            bulkOperation {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }
      `),
      {
        queryStr: queryStr
      }).then(async (res) => {
        console.log("res", res);
        const operationId = res?.bulkOperationRunQuery?.bulkOperation?.id;
        if (!operationId) return;
        await api.shopSettings.update(record.id, {
          processStatus: {
            state: "PROCESSING",
            operationId: operationId,
            type: "APPLY"
          }
        }).then(() => console.log("updated shopSettings operationId", record.id))
      }).catch((err) => {
        console.log("err", err);
      })
    } else if (params.shopSettings?.isActive === false) {
      const shop = await api.shopifyShop.findOne(record.shopId)
      const markedImagesCount = shop.markedImagesCount;
      console.log("markedImagesCount", markedImagesCount);

      if(markedImagesCount === 0) {
        return;
      }
      
      // Restore all the product images
      const operationId = uuidv4();
      console.log("operationId", operationId);
      await api.shopSettings.update(record.id, {
        processStatus: {
          state: "REMOVING",
          operationId: operationId,
        }
      })

      // Trigger the lambda function to remove all the images
      const lambdaClient = new Lambda({ 
        region: "us-east-1" ,
        credentials: {
          accessKeyId: process.env.AWS_SFN_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SFN_SECRET_ACCESS_KEY
        }
      });
      lambdaClient.invoke({
        FunctionName: "watermark-remove",
        InvocationType: "Event",
        Payload: JSON.stringify({
          operationId: operationId,
          shopId: record.shopId,
          shopUrl: record.shopUrl,
        })
      }, (err, data) => {
        if (err) {
          console.log("err", err);
        } else {
          console.log("data", data);
        }
      })
    }
  }
}

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  timeoutMS: 600000,
  triggers: { api: true },
};