import type { GadgetSettings } from "gadget-server";

export const settings: GadgetSettings = {
  type: "gadget/settings/v1",
  frameworkVersion: "v1.1.0",
  plugins: {
    connections: {
      shopify: {
        apiVersion: "2025-04",
        enabledModels: [
          "shopifyAppCredit",
          "shopifyAppSubscription",
          "shopifyAppUsageRecord",
          "shopifyBulkOperation",
        ],
        type: "partner",
        scopes: ["write_products"],
      },
    },
  },
};
