import {
  transitionState,
  save,
  ActionOptions,
  ShopifySyncState,
  AbortShopifySyncActionContext,
} from "gadget-server";

/**
 * @param { AbortShopifySyncActionContext } context
 */
export async function run({ record }) {
  // Move the sync from Running (or Created) to Aborted
  // If your sync only transitions from Running, keep the first line only.
  try {
    transitionState(record, { from: ShopifySyncState.Running, to: ShopifySyncState.Aborted });
  } catch {
    transitionState(record, { from: ShopifySyncState.Created, to: ShopifySyncState.Aborted });
  }
  await save(record);
}

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  apiIdentifier: "abort",  
  triggers: { api: true },
};
