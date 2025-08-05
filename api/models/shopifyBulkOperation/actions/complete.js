import { PutObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";
import { SFN } from "@aws-sdk/client-sfn";
import { transitionState, applyParams, preventCrossShopDataAccess, finishBulkOperation, save, ActionOptions, ShopifyBulkOperationState, CompleteShopifyBulkOperationActionContext } from "gadget-server";

/**
 * @param { CompleteShopifyBulkOperationActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  transitionState(record, {from: ShopifyBulkOperationState.Created, to: ShopifyBulkOperationState.Completed});
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await finishBulkOperation(record);
  await save(record);
};

/**
 * @param { CompleteShopifyBulkOperationActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // =========== MAIN ===========
  // Find the shop settings and update the processStatus
  const shopSettings = await api.shopSettings.findByShopId(record.shopId)
  const activeSettings = shopSettings.activeData;
  const featuredOnly = activeSettings.featuredOnly;
  const processStatus = shopSettings.processStatus
  
  if(!processStatus || (record.id.toString() !== processStatus?.operationId?.replace("gid://shopify/BulkOperation/", "")) || record.status !== "completed") {
    console.log("webhook not matching");
    return
  }

  if(record.type === "query"){
    // Get the media list from the bulk operation
    const mediaList = []
  
    // Fetch the file from shopify and bulk create records in database
    const response = await fetch(record.url)
    const textData = await response.text();
    /** @type {Array} */
    const jsonLines = textData.split('\n');
    for (const jsonLine of jsonLines) {
      // Limit to 50 images for free users
      if(shopSettings.isPaidUser !== true && mediaList.length > 50){
        break
      }
      if(jsonLine.length > 0){
        const jsonData = JSON.parse(jsonLine)
        if (featuredOnly){
          if(jsonData?.id?.includes("gid://shopify/Product/")){
            const mediaUrl = jsonData?.featuredMedia?.preview?.image?.src
            const parentId = jsonData?.id
            const mediaId = jsonData?.featuredMedia?.id
            const altText = jsonData?.featuredMedia?.alt
            if(mediaUrl){
              mediaList.push({
                mediaUrl: mediaUrl,
                parentId: parentId,
                mediaId: mediaId,
                altText: altText,
              })
            }
          }
        } else {
          if (jsonData?.mediaContentType === "IMAGE") {
            const mediaUrl = jsonData?.preview?.image?.src
            const parentId = jsonData['__parentId']
            const mediaId = jsonData?.id
            const altText = jsonData?.alt
            if(mediaUrl){
              mediaList.push({
                mediaUrl: mediaUrl,
                parentId: parentId,
                mediaId: mediaId,
                altText: altText,
              });
            }
          }
        }
      }
    }

    // Check if image count is greater than 0
    if(mediaList.length === 0){
      console.log("No images found");
      return
    }
  
    // Trigger the AWS Step Function to process the images
    const sfnClient = new SFN({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_SFN_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SFN_SECRET_ACCESS_KEY
      },
    })
    const s3Client = new S3({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
      },
    });

    // To track the state of the operation PROCESSING, FAILED, COMPLETED
    let stateUpdate = ""

    const inputJson = JSON.stringify(mediaList)
    const inputJsonKey = shopSettings.shopUrl + "/input/" + record.id + ".json";
    // Save the inputJson to S3 for Step Function
    await s3Client.putObject({
      Bucket: "watermark-app",
      Key: inputJsonKey,
      Body: inputJson,
      ContentType: "application/json",
    })

    // Trigger the AWS Step Function
    await sfnClient.startExecution({
      stateMachineArn: "arn:aws:states:us-east-1:140023387777:stateMachine:WatermarkSteps",
      name: record.shopId + "-" + record.id,
      input: JSON.stringify({
        shopId: record.shopId,
        shopUrl: shopSettings.shopUrl,
        inputBucket: "watermark-app",
        inputJson: inputJsonKey,
        operationId: record.id,
      }),
    }).then(res => {
      stateUpdate = "PROCESSING"
    }).catch(e => {
      console.error("Error at SFN trigger:", e);
      console.error("Error details:", e.$metadata ? JSON.stringify(e.$metadata) : "No metadata");
      stateUpdate = "FAILED"
    })
  
    // Update the shopSettings processStatus
    await api.shopSettings.update(shopSettings.id, {
      processStatus: {
        ...processStatus,
        state: stateUpdate
      }
    })
  }

  if (record.type === "mutation"){
    // Mark task as completed in the database
    await api.shopSettings.update(shopSettings.id, {
      processStatus: {
        state: "COMPLETED",
        operationId: record.id,
        updatedAt: new Date(),
      }
    })

    // Create usages charge based on the number of images if not created already
    // if(!shopSettings.usageChargeId){
    //   await api.usageCharge.create(shopSettings.id, {
    //     usageCharge: {
    //       shopId: shopSettings.id,
    //       usageCount: mediaList.length,
    //     }
    //   })
    // }
  }
  
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: false },
};
