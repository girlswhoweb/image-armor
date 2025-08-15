import { api } from "../api";

export function useAcceptAppCharge() {
  return async function acceptAppCharge(plan = "starter") {
    try {
      const res = await api.fetch(`/confirm-charge?plan=${encodeURIComponent(plan)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const data = await res.json().catch(() => null);

      // Billing API returns confirmationUrl
      const url =
        data?.confirmationUrl ||
        data?.appSubscriptionCreate?.confirmationUrl; // legacy fallback

      if (url) {
        (window.top ?? window).location.href = url;
      } else {
        console.error("confirm-charge: no URL in response", data);
      }
    } catch (err) {
      console.error("confirm-charge: request failed", err);
    }
  };
}
