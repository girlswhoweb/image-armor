import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyShop" model, go to https://imagearmor.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Shop",
  fields: {
    cookieConsentLevel: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-cookie_consent_level::FieldStorageEpoch-DataModel-Shopify-Shop-cookie_consent_level-initial",
    },
    currencyBackup: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-currency::FieldStorageEpoch-DataModel-Shopify-Shop-currency-initial",
    },
    eligibleForCardReaderGiveaway: {
      type: "boolean",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-eligible_for_card_reader_giveaway::FieldStorageEpoch-DataModel-Shopify-Shop-eligible_for_card_reader_giveaway-initial",
    },
    enabledPresentmentCurrenciesBackup: {
      type: "json",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-enabled_presentment_currencies::FieldStorageEpoch-DataModel-Shopify-Shop-enabled_presentment_currencies-initial",
    },
    forceSsl: {
      type: "boolean",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-force_ssl::FieldStorageEpoch-DataModel-Shopify-Shop-force_ssl-initial",
    },
    mantleApiToken: { type: "string", storageKey: "9zHdwSLej6uW" },
    markedImagesCount: {
      type: "computed",
      sourceFile: "api/models/shopifyShop/markedImagesCount.gelly",
      storageKey:
        "ModelField-uHMQZ-38sxYu::FieldStorageEpoch-rdVsukfhQCay",
    },
    onboarding: {
      type: "hasOne",
      child: { model: "onboarding", belongsToField: "shop" },
      storageKey: "c_Idx2y-aJLx",
    },
    processedImages: {
      type: "hasMany",
      children: { model: "processedImages", belongsToField: "shop" },
      storageKey:
        "ModelField-nz1cW_vD9o7N::FieldStorageEpoch-IqSBPtWLykx8",
    },
    processedImagesCount: {
      type: "computed",
      sourceFile: "api/models/shopifyShop/processedImagesCount.gelly",
      storageKey:
        "ModelField-7qoDRjH06Hvi::FieldStorageEpoch-sB82auAoeBmE",
    },
    shopSettings: {
      type: "hasOne",
      child: { model: "shopSettings", belongsToField: "shop" },
      storageKey:
        "ModelField-TwQAAzSOK59h::FieldStorageEpoch-cF5rnqbR8OC_",
    },
    weightUnitBackup: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Shop-weight_unit::FieldStorageEpoch-DataModel-Shopify-Shop-weight_unit-initial",
    },
  },
  shopify: {
    fields: [
      "address1",
      "address2",
      "alerts",
      "appCredits",
      "appSubscriptions",
      "appUsageRecords",
      "billingAddress",
      "bulkOperations",
      "checkoutApiSupported",
      "city",
      "countriesInShippingZones",
      "country",
      "countryCode",
      "countryName",
      "countyTaxes",
      "currency",
      "currencyFormats",
      "customerAccounts",
      "customerAccountsV2",
      "customerEmail",
      "description",
      "domain",
      "eligibleForPayments",
      "email",
      "enabledPresentmentCurrencies",
      "finances",
      "gdprRequests",
      "googleAppsDomain",
      "googleAppsLoginEnabled",
      "hasDiscounts",
      "hasGiftCards",
      "hasStorefront",
      "ianaTimezone",
      "latitude",
      "longitude",
      "marketingSmsContentEnabledAtCheckout",
      "moneyFormat",
      "moneyInEmailsFormat",
      "moneyWithCurrencyFormat",
      "moneyWithCurrencyInEmailsFormat",
      "multiLocationEnabled",
      "myshopifyDomain",
      "name",
      "orderNumberFormatPrefix",
      "orderNumberFormatSuffix",
      "passwordEnabled",
      "phone",
      "planDisplayName",
      "planName",
      "planPublicDisplayName",
      "preLaunchEnabled",
      "primaryLocale",
      "province",
      "provinceCode",
      "requiresExtraPaymentsAgreement",
      "resourceLimits",
      "richTextEdiorUrl",
      "setupRequired",
      "shipsToCountries",
      "shopOwner",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
      "source",
      "syncs",
      "taxShipping",
      "taxesIncluded",
      "taxesOffset",
      "timezone",
      "timezoneAbbreviation",
      "timezoneOffsetMinutes",
      "transactionalSmsDisabled",
      "unitSystem",
      "url",
      "weightUnit",
      "zipCode",
    ],
  },
};
