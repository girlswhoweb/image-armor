import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "processedImages" model, go to https://imagearmor.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Owh2uepILYFd",
  fields: {
    altBackup: {
      type: "string",
      storageKey:
        "ModelField-k-Q1dHfk7DzQ::FieldStorageEpoch-07NNzy-9mZKC",
    },
    bulkOperation: {
      type: "belongsTo",
      parent: { model: "shopifyBulkOperation" },
      storageKey: "3Hzli0zapCoV::5oj82JIM--Wd",
    },
    isMarked: {
      type: "boolean",
      default: false,
      storageKey:
        "ModelField-VS-p161yv7_l::FieldStorageEpoch-5f1Gp2tCqDPw",
    },
    mediaId: {
      type: "string",
      validations: { required: true },
      storageKey:
        "ModelField-t7tKqq3Z05m2::FieldStorageEpoch-r0kqhvA744gJ",
    },
    originalKey: {
      type: "string",
      validations: { required: true },
      storageKey: "t9m-KSLtP9vj::zkA0Ri-UHnVh",
    },
    processedAlt: {
      type: "string",
      validations: { stringLength: { min: 0, max: 512 } },
      storageKey: "gjGMkRWCjfBG::0mFxDru_QtlM",
    },
    processedKey: {
      type: "string",
      storageKey:
        "ModelField-9ZZXquxWnNWI::FieldStorageEpoch-EAiAjkj2hdeU",
    },
    productId: {
      type: "string",
      validations: { required: true },
      storageKey: "nGIzDnCFO7K-::1yYdNao8WstS",
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey:
        "ModelField-xEB4R7b1K5gk::FieldStorageEpoch-LdqNk7QdWRXc",
    },
  },
};
