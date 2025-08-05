import { BulkMediaUpdateGlobalActionContext } from "gadget-server";
import xml2json from "xml-js"

/**
 * @param { BulkMediaUpdateGlobalActionContext } context
 */
export async function run({ params, logger, api, connections, scope }) {
  // ============ MAIN CODE ============
  try {
    // Get the shopify domain from the params
    console.log("params", params);
    const { shopifyDomain: shopUrl, jsonlUrl, operationId, shopId } = params;
    const shopify = await connections.shopify.forShopDomain(shopUrl);

    // Get the size of the jsonl file
    const response = await fetch(jsonlUrl);
    const fileSize = response.headers.get("content-length");
    const filename = `data-${operationId}`;

    console.log("fileSize", fileSize);
    
    // Download the jsonl file from the url and upload it to the staged url with the parameters as form data
    const stageUpload = await shopify.graphql((`
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
              url,
              resourceUrl,
              parameters {
                  name,
                  value
              }
          }
          userErrors {
            field
            message
          }
        }
      }
    `), {
      input: {
        filename,
        // fileSize,
        httpMethod: "POST",
        mimeType: "text/jsonl",
        resource: "BULK_MUTATION_VARIABLES"
      }
    })
    const { url, parameters } = stageUpload.stagedUploadsCreate.stagedTargets[0];
    const formData = new FormData();
    const textData = await response.text();
    console.log('textData', textData.substring(0, 300));
    // const fileBlob = await response.blob(); // Get the data as a Blob instead of text
    const fileBlob = new Blob([textData], { type: response.headers.get("content-type") });
    parameters.forEach((parameter) => {
      formData.append(parameter.name, parameter.value);
    })
    // formData.append("file", textData);
    formData.append("file", fileBlob, filename);
    const stageUploadData = await fetch(url, {
      method: "POST",
      body: formData
    })
    const stageUploadDataText = await stageUploadData.text();
    console.log("stageUploadDataText", stageUploadDataText);
    const stageResult = xml2json.xml2js(stageUploadDataText, {compact: true, spaces: 4})
    const stageKey = stageResult?.PostResponse?.Key?._text;
  
    if (!stageKey) {
      // Mark task as failed in the database
      await api.shopSettings.update(shopId, {
        processStatus: {
          state: "FAILED",
          operationId: operationId,
        }
      })
      scope.result = "error";
      return;
    }
  
    // Trigger the bulk operation
    const bulkMutation = await shopify.graphql((`
      mutation bulkMediaUpdate($fileKey: String!) {
        bulkOperationRunMutation(
          mutation: "mutation call($media: [UpdateMediaInput!]!, $productId: ID!) { productUpdateMedia(media: $media, productId: $productId) { media { status } mediaUserErrors { message } product { id } } } ",
          stagedUploadPath: $fileKey) {
          bulkOperation {
            id
            url
            status
          }
          userErrors {
            message
            field
          }
        }
      }
    `), {
      fileKey: stageKey
    })
  
    // Check for errors
    if (bulkMutation.bulkOperationRunMutation.userErrors.length > 0) {
      // Mark task as failed in the database
      await api.shopSettings.update(shopId, {
        processStatus: {
          state: "FAILED",
          operationId: operationId,
        }
      })
      scope.result = "error";
      return;
    } else {
      // Mark task as uploading in the database and update the operationId
      // const shopSettings = await api.shopSettings.findByShopId(shopId);
      // handle errors
      let shopSettings;
      try {
        shopSettings = await api.shopSettings.findByShopId(shopId);
      } catch (fetchErr) {
        logger.error("Error fetching shopSettings", {
          shopId,
          error: fetchErr?.message,
          stack: fetchErr?.stack,
        });
        scope.result = "error";
        return;
      }

      const operationIdLocal = bulkMutation.bulkOperationRunMutation.bulkOperation.id;
      console.log("operationId on mutate", operationIdLocal);
      await api.shopSettings.update(shopSettings.id, {
        processStatus: {
          // state: "UPLOADING",
          ...shopSettings.processStatus,
          operationId: operationIdLocal
        }
      })
    }
  
    scope.result = "success";
  } catch (error) {
    console.log("error", error);
    scope.result = "error";
  }
};

export const params = {
  shopifyDomain: {
    type: "string"
  },
  jsonlUrl: {
    type: "string"
  },
  operationId: {
    type: "string"
  },
  shopId: {
    type: "string"
  }
};

export const options = { triggers: { api: true } }