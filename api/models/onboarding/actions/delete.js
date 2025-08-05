import { deleteRecord, ActionOptions, DeleteOnboardingActionContext } from "gadget-server";

/**
 * @param { DeleteOnboardingActionContext } context
 */
export async function run({ params, record, logger, api, connections }) {
  await deleteRecord(record);
};

/**
 * @param { DeleteOnboardingActionContext } context
 */
export async function onSuccess({ params, record, logger, api, connections }) {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "delete",
};
