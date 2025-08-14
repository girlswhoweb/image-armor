import { api } from "../api";

export function useAcceptAppCharge() {
  return async function acceptAppCharge(plan = "starter") {
    try {
      const res = await api.fetch(`/confirm-charge?plan=${encodeURIComponent(plan)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      // Keep the same flow: parse JSON and redirect top-level
      const data = await res.json().catch(() => null);

      // New managed-pricing route returns { pricingUrl }
      const url =
        data?.pricingUrl ||                  // managed pricing
        data?.confirmationUrl ||             // (fallback if you ever switch back)
        data?.appSubscriptionCreate?.confirmationUrl; // (old shape)

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
