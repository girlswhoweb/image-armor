import { Lambda } from "@aws-sdk/client-lambda";
import { RestoreImagesGlobalActionContext } from "gadget-server";
import { v4 as uuidv4 } from "uuid";

/**
 * @param { RestoreImagesGlobalActionContext } context
 */
export async function run({ params, logger, api, connections }) {
  const { shopUrl } = params;
  const shopSettings = await api.shopSettings.findByShopUrl(shopUrl);
  if (!shopSettings) return;

  // Restore all the product images
  const operationId = uuidv4();
  console.log("operationId", operationId);
  await api.shopSettings.update(shopSettings.id, {
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
      shopId: shopSettings._shopId,
      shopUrl: shopSettings.shopUrl,
    })
  }, (err, data) => {
    if (err) {
      console.log("err", err);
    } else {
      console.log("data", data);
    }
  })
};



export const params = {
  shopUrl: {
    type: "string"
  },
};

export const options = { triggers: { api: true } }