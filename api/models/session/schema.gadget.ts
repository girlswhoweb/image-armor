import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "session" model, go to https://imagearmor.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-ESm1LuUSRbBM",
  fields: {
    roles: {
      type: "roleList",
      default: ["unauthinticated"],
      storageKey:
        "ModelField-fbnzS69gEE_J::FieldStorageEpoch-oWEIvqYe8Q1X",
    },
  },
  shopify: { fields: ["shop", "shopifySID"] },
};
