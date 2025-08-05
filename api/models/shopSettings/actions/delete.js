import { deleteRecord, ActionOptions, DeleteShopSettingsActionContext } from "gadget-server";

/**
 * @param { DeleteShopSettingsActionContext } context
 */
export async function run({ params, record, logger, api }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteShopSettingsActionContext } context
 */
export async function onSuccess({ params, record, logger, api }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
  triggers: { api: true },
};
