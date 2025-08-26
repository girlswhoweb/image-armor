import { Banner, Button, InlineError, Page, Layout, Spinner } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useMantle } from "@heymantle/react";
import { PlanCardStack, PlanCardType } from "@heymantle/polaris";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { api } from "../api";

export default function PlansPage() {
  const navigate = useNavigate();
  const { customer, plans, subscribe, loading, error } = useMantle();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "grid", placeItems: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Page title="Plans">
        <InlineError message={`Unable to load plans: ${String(error)}`} fieldID="plans" />
      </Page>
    );
  }

  const cancel = async () => {
    setBusy(true);
    setErr("");
    try {
      const resp = await api.fetch("/billing-cancel", { method: "POST" });
      const json = await resp.json();
      if (!resp.ok || json?.ok !== true) {
        throw new Error(json?.message || "Cancel failed");
      }
      // Reload so Mantle hooks & your UI show “no active subscription”
      location.reload();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Plans" backAction={{ content: "Home", onAction: () => navigate("/") }}>
      <TitleBar title="Select a plan" />
      <Layout.Section>
        <PlanCardStack
          cardType={PlanCardType.Highlighted}
          customer={customer}
          plans={plans}
          onSelectPlan={async ({ plan, discount }) => {
            const subscription = await subscribe({
              planId: plan.id,
              discountId: discount?.id,
              returnUrl: "/plans", // where Shopify sends them back in your app
            });
            if (subscription?.error) {
              console.error("Unable to subscribe:", subscription.error);
              return;
            }
            if (subscription?.confirmationUrl) {
              // Open Shopify Billing confirmation page
              open(subscription.confirmationUrl, "_top");
            }
          }}
        />

        {err && <InlineError fieldID="cancel" message={err} />}
      
        <div style={{ marginTop: 16 }}>
          <Button tone="critical" onClick={cancel} loading={busy}>
            Cancel subscription
          </Button>
        </div>

        <div style={{ marginTop: 8 }}>
          <Banner tone="subdued">
            You can also cancel by uninstalling the app from Shopify; that
            immediately ends the subscription.
          </Banner>
        </div>
      </Layout.Section>
    </Page>
  );
}
