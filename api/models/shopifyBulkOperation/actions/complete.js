import { S3 } from "@aws-sdk/client-s3";
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
/**
 * @param { CompleteShopifyBulkOperationActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // =========== MAIN ===========
  const shopSettings = await api.shopSettings.findByShopId(record.shopId);
  const activeSettings = shopSettings.activeData;
  const featuredOnly = !!activeSettings?.featuredOnly;
  const processStatus = shopSettings.processStatus;

  // Expire legacy starter plan after 7 days (kept from your code)
  if (shopSettings.starterPlanUser && shopSettings.starterPlanStartDate) {
    const start = new Date(shopSettings.starterPlanStartDate);
    const now = new Date();
    const diffDays = (now - start) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      await api.shopSettings.update(shopSettings.id, {
        starterPlanUser: false,
        isPaidUser: false
      });
      console.log("Starter plan expired for shop", shopSettings.shopUrl);
    }
  }

  // Sanity: ensure this callback corresponds to the tracked operation
  if (
    !processStatus ||
    record.status !== "completed" ||
    (processStatus.operationId &&
     record.id.toString() !== processStatus.operationId.replace("gid://shopify/BulkOperation/", ""))
  ) {
    console.log("webhook not matching");
    return;
  }

  // ---------------------------
  // TYPE: QUERY  (build worklist, clamp by trial remaining, start SFN)
  // ---------------------------
  if (record.type === "query") {
  const paid = !!shopSettings.isPaidUser;

  // Source of truth for trial comes from your DB
  const trialEverStarted = !!shopSettings.trialEverStarted;
  const trialEndsAtMs = shopSettings.trialEndsAt ? new Date(shopSettings.trialEndsAt).getTime() : 0;
  const inTrial = !paid && trialEverStarted && Date.now() < trialEndsAtMs;

  // Hard stop: unpaid and not in trial
  if (!paid && !inTrial) {
    await api.shopSettings.update(shopSettings.id, {
      processStatus: { ...(processStatus || {}), state: "LIMITED", updatedAt: new Date() }
    });
    return;
  }

  // Trial cap only while inTrial
  const TRIAL_CAP = 50;
  const used = Number(shopSettings.markedImagesCount || 0);
  const remainingAllowance = inTrial ? Math.max(0, TRIAL_CAP - used) : Number.POSITIVE_INFINITY;

  if (remainingAllowance === 0) {
    await api.shopSettings.update(shopSettings.id, {
      processStatus: { ...(processStatus || {}), state: "LIMITED", updatedAt: new Date() }
    });
    return;
  }

  // Build media list (clamped by remainingAllowance if in trial)
  const mediaList = [];
  const response = await fetch(record.url);
  const textData = await response.text();
  const jsonLines = textData.split("\n");

  for (const jsonLine of jsonLines) {
    if (remainingAllowance !== Number.POSITIVE_INFINITY && mediaList.length >= remainingAllowance) break;
    if (!jsonLine) continue;
    const jsonData = JSON.parse(jsonLine);

    if (featuredOnly) {
      if (jsonData?.id?.includes("gid://shopify/Product/")) {
        const mediaUrl = jsonData?.featuredMedia?.preview?.image?.src;
        const parentId = jsonData?.id;
        const mediaId = jsonData?.featuredMedia?.id;
        const altText = jsonData?.featuredMedia?.alt;
        if (mediaUrl) mediaList.push({ mediaUrl, parentId, mediaId, altText });
      }
    } else {
      if (jsonData?.mediaContentType === "IMAGE") {
        const mediaUrl = jsonData?.preview?.image?.src;
        const parentId = jsonData["__parentId"];
        const mediaId = jsonData?.id;
        const altText = jsonData?.alt;
        if (mediaUrl) mediaList.push({ mediaUrl, parentId, mediaId, altText });
      }
    }
  }

  // If truly no items to process, don’t mark LIMITED (that’s only for allowance)
  if (mediaList.length === 0) {
    await api.shopSettings.update(shopSettings.id, {
      processStatus: {
        ...(processStatus || {}),
        state: "FAILED",              // or "COMPLETED" if you prefer
        plannedCount: 0,
        operationId: record.id,
        updatedAt: new Date()
      }
    });
    return;
  }

  // ----- Proceed with S3 upload + Step Function trigger -----
  const sfnClient = new SFN({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_SFN_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SFN_SECRET_ACCESS_KEY
    }
  });
  const s3Client = new S3({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    }
  });

  const inputJson = JSON.stringify(mediaList);
  const inputJsonKey = `${shopSettings.shopUrl}/input/${record.id}.json`;
  await s3Client.putObject({
    Bucket: "watermark-app",
    Key: inputJsonKey,
    Body: inputJson,
    ContentType: "application/json"
  });

  const plannedCount = mediaList.length;
  let stateUpdate = "";

  try {
    await sfnClient.startExecution({
      stateMachineArn: "arn:aws:states:us-east-1:140023387777:stateMachine:WatermarkSteps-dev",
      name: `${record.shopId}-${record.id}`,
      input: JSON.stringify({
        shopId: record.shopId,
        shopUrl: shopSettings.shopUrl,
        inputBucket: "watermark-app",
        inputJson: inputJsonKey,
        operationId: record.id,
        plannedCount
      })
    });
    stateUpdate = "PROCESSING";
  } catch (e) {
    console.error("Error at SFN trigger:", e);
    console.error(
      "Error details:",
      e.$metadata ? JSON.stringify(e.$metadata) : "No metadata"
    );
    stateUpdate = "FAILED";
  }

  await api.shopSettings.update(shopSettings.id, {
    processStatus: {
      ...processStatus,
      state: stateUpdate,
      plannedCount: stateUpdate === "PROCESSING" ? plannedCount : 0
    }
  });

  return;
}


  // ---------------------------
  // TYPE: MUTATION  (mark completed, send usage to Mantle, bump local counter)
  // ---------------------------
  if (record.type === "mutation") {
    // Re-fetch to avoid stale processStatus/plannedCount
    const fresh = await api.shopSettings.findByShopId(record.shopId);
    const plannedCount = Number(fresh?.processStatus?.plannedCount || 0);

    // Mark COMPLETE and clear plannedCount
    await api.shopSettings.update(fresh.id, {
      processStatus: {
        state: "COMPLETED",
        operationId: record.id,
        updatedAt: new Date(),
        plannedCount: 0
      }
    });

    if (plannedCount > 0) {
    try {
      const { MantleClient } = await import("@heymantle/client");
      const mantle = new MantleClient({
        appId: process.env.GADGET_PUBLIC_MANTLE_APP_ID,
        apiKey: process.env.MANTLE_API_KEY
      });
      await mantle.sendUsageEvent({
        eventName: "images_generated", // metric = sum of property 'count'
        properties: { count: plannedCount }
      });
    } catch (err) {
      console.error("Mantle usage send failed:", err);
      // (don’t throw; avoid breaking completion flow)
    }

    const newTotal = Number(fresh.markedImagesCount || 0) + plannedCount;
    await api.shopSettings.update(fresh.id, { markedImagesCount: newTotal });
  }

    return;
  }
}

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: false },
};
