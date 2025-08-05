import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyBulkOperation" model, go to https://imagearmor.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-BulkOperation",
  fields: {
    processedImages: {
      type: "hasMany",
      children: {
        model: "processedImages",
        belongsToField: "bulkOperation",
      },
      storageKey: "7vqEwQsNJFIq::68GjOaKPv3sv",
    },
  },
  shopify: {
    fields: [
      "completedAt",
      "errorCode",
      "fileSize",
      "objectCount",
      "partialDataUrl",
      "query",
      "rootObjectCount",
      "status",
      "type",
      "url",
    ],
  },
};
