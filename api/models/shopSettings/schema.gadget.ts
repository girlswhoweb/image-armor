import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopSettings" model, go to https://imagearmor.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-04JjF2Epn8_y",
  fields: {
    _shopId: {
      type: "string",
      validations: { unique: true },
      storageKey:
        "ModelField-VvZa_EzAjWRG::FieldStorageEpoch-HwMrzQiy4Zb_",
    },
    activeData: {
      type: "json",
      storageKey:
        "ModelField-tRhCqqWWjTGo::FieldStorageEpoch-Vl7PW6Zcoa4S",
    },
    autoApply: {
      type: "boolean",
      default: false,
      storageKey:
        "ModelField-GIIbXvZ5FXJK::FieldStorageEpoch-J7n60FkbtkMV",
    },
    data: {
      type: "json",
      default: {
        watermarkEnabled: true,
        markType: "text",
        gridEnabled: true,
        gridRotated: true,
        position: "center",
        opacity: 85,
        textInput: "Your Brand",
        fontSize: "medium",
        fontStyle: "basic",
        imageWidth: 35,
        logoUrl: "",
        logoKey: "",
        optimisationEnabled: true,
        compression: 25,
        altTextEnabled: true,
        altFormat:
          "[product_name] - [product_type] by [vendor] - [tags]",
        altOverwrite: false,
        sourceSize: "",
        outputSize: "",
        radioValue: "allProducts",
        featuredOnly: false,
        selectedProducts: [],
        selectedCollections: [],
        notificationSetting: { taskUpdates: true },
        isSaved: true,
      },
      storageKey:
        "ModelField-QXwhIJpikbmi::FieldStorageEpoch-zFr5UVJ6jesC",
    },
    imageLimit: {
      type: "number",
      default: 100,
      storageKey:
        "ModelField-iNblCumHR9Vy::FieldStorageEpoch-EuEnRkfwGbTe",
    },
    isActive: {
      type: "boolean",
      default: false,
      storageKey:
        "ModelField-9-TZNxZnGWHA::FieldStorageEpoch-dojUiCR4f42U",
    },
    isDifferent: {
      type: "boolean",
      default: false,
      storageKey:
        "ModelField-Ea7kqkjs68PF::FieldStorageEpoch-ON5XsEev0tRd",
    },
    isMigrated: {
      type: "boolean",
      default: true,
      storageKey:
        "ModelField-lUGXUEHd0265::FieldStorageEpoch-9sQUmcJparHW",
    },
    isPaidUser: { type: "boolean", storageKey: "5vqTAVRSA-Lh" },
    processStatus: {
      type: "json",
      default: { state: "idel", operationId: null },
      storageKey:
        "ModelField-xttR8uKrvxEK::FieldStorageEpoch-vrboNQghfBo7",
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey:
        "ModelField-y0rSR1kyq1EI::FieldStorageEpoch-MjCcoMoU5y5t",
    },
    shopUrl: {
      type: "string",
      validations: { unique: true },
      storageKey:
        "ModelField-nCRUvqL6o3q8::FieldStorageEpoch-YGmTT1kZ-noF",
    },
  },
};
