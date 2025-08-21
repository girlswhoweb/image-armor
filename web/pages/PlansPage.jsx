import { Page, Layout, Spinner, InlineError } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useMantle } from "@heymantle/react";
import { PlanCardStack, PlanCardType } from "@heymantle/polaris";
import { useNavigate } from "react-router-dom";

export default function PlansPage() {
  const navigate = useNavigate();
  const { customer, plans, subscribe, loading, error } = useMantle();

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
      </Layout.Section>
    </Page>
  );
}
