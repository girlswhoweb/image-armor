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


      // ==== Start with the bulk watermark ====
      // Run a bulk query to get all the product media based on the settings
      const activeSettings = params.shopSettings.activeData;
      const featuredOnly = activeSettings.featuredOnly;
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
        FunctionName: "watermark-remove-dev",
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