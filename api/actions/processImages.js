import { ProcessImagesGlobalActionContext } from "gadget-server";
import { bulkQuery, bulkQueryByCollection, bulkQueryById } from "../../utils/bulkFunctions";

/**
 * @param { ProcessImagesGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  const { shopUrl } = params;
  const shopSettings = await api.shopSettings.findByShopUrl(shopUrl);
  console.log("shopSettings", shopSettings);
  if (!shopSettings) return;
  // Run a bulk query to get all the product media based on the settings
  const activeSettings = shopSettings.activeData;
  const shopify = await connections.shopify.forShopDomain(shopUrl);
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
    await api.shopSettings.update(shopSettings.id, {
      processStatus: {
        state: "PROCESSING",
        operationId: operationId,
        type: "APPLY"
      }
    }).then(() => console.log("updated shopSettings operationId", shopSettings.id))
  }).catch((err) => {
    console.log("err", err);
  })
};

export const params = {
  shopUrl: {
    type: "string"
  },
};

export const options = { triggers: { api: true } }