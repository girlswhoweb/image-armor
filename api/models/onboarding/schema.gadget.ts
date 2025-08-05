import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "onboarding" model, go to https://imagearmor.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "El7sUSjwlKFP",
  fields: {
    applyWatermark: {
      type: "boolean",
      default: false,
      storageKey: "L77wewuQRe10",
    },
    disableDev: {
      type: "boolean",
      default: false,
      storageKey: "jDBhxWyqjVsL",
    },
    disableRightClick: {
      type: "boolean",
      default: false,
      storageKey: "ZQrvrwOqXjlS",
    },
    disableTextCopy: {
      type: "boolean",
      default: false,
      storageKey: "-f2uANejMYJ_",
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "tLl8Up5TymXd",
    },
  },
};
