import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://imagearmor.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "shopify-app-users": {
      storageKey: "Role-Shopify-App",
      models: {
        onboarding: {
          read: {
            filter:
              "accessControl/filters/onboarding/Onboarding.gelly",
          },
          actions: {
            create: {
              filter:
                "accessControl/filters/onboarding/Onboarding.gelly",
            },
            delete: true,
            update: {
              filter:
                "accessControl/filters/onboarding/Onboarding.gelly",
            },
          },
        },
        shopifyAppCredit: {
          read: {
            filter:
              "accessControl/filters/shopifyAppCredit/shopifyAppCredit.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppSubscription: {
          read: {
            filter:
              "accessControl/filters/shopifyAppSubscription/shopifyAppSubscription.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyBulkOperation: {
          read: {
            filter:
              "accessControl/filters/shopifyBulkOperation/shopifyBulkOperation.gelly",
          },
          actions: {
            cancel: true,
            complete: true,
            create: true,
            expire: true,
            fail: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: {
            filter:
              "accessControl/filters/shopifyGdprRequest/shopifyGdprRequest.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyShop: {
          read: {
            filter:
              "accessControl/filters/shopifyShop/shopifyShop.gelly",
          },
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: {
            filter:
              "accessControl/filters/shopifySync/shopifySync.gelly",
          },
          actions: {
            complete: true,
            error: true,
            run: true,
          },
        },
        shopSettings: {
          read: {
            filter:
              "accessControl/filters/shopSettings/shopSettings.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
      },
    },
    unauthinticated: {
      storageKey: "unauthenticated",
    },
    admin: {
      storageKey: "Role-QixFZP_t6XXU",
      default: {
        read: true,
        action: true,
      },
      models: {
        onboarding: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        processedImages: {
          read: true,
          actions: {
            create: true,
            update: true,
          },
        },
        session: {
          read: true,
        },
        shopifyAppCredit: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppSubscription: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppUsageRecord: {
          read: true,
        },
        shopifyBulkOperation: {
          read: true,
          actions: {
            cancel: true,
            complete: true,
            create: true,
            expire: true,
            fail: true,
            update: true,
          },
        },
        shopifyShop: {
          read: true,
          actions: {
            install: true,
            reinstall: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: true,
          actions: {
            complete: true,
            error: true,
            run: true,
          },
        },
        shopSettings: {
          read: true,
          actions: {
            create: true,
            update: true,
          },
        },
      },
      actions: {
        bulkMediaUpdate: true,
        chargeShop: true,
        globalShopifySync: true,
        migrate: true,
        ping: true,
        processImages: true,
        restoreImages: true,
        scheduledShopifySync: true,
        updateStatus: true,
      },
    },
    "aws-lambda": {
      storageKey: "Role-nQL1ca352Ic_",
      models: {
        processedImages: {
          read: true,
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyShop: {
          read: true,
        },
        shopSettings: {
          read: true,
        },
      },
      actions: {
        bulkMediaUpdate: true,
      },
    },
  },
};
