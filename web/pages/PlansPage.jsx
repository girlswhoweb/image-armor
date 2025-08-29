// web/pages/PlansPage.jsx
import { Banner, Button, InlineError, Page, Layout, Spinner } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useMantle } from "@heymantle/react";
import { PlanCardStack, PlanCardType } from "@heymantle/polaris";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useFindFirst } from "@gadgetinc/react";
import { api } from "../api";

const TRIAL_CAP = 50;
const PRO_NO_TRIAL_ID = process.env.GADGET_PUBLIC_MANTLE_PLAN_ID_PRO_NO_TRIAL;

export default function PlansPage() {
  const navigate = useNavigate();
  const { customer, plans, subscribe, cancelSubscription, loading, error } = useMantle();


  // Pull your local usage counter (+ optional isPaidUser if you keep it)
  const [{ data: shop, fetching: fetchingShop }] = useFindFirst(api.shopifyShop, {
    select: { markedImagesCount: true, isPaidUser: true }
  });

  // upgrade button state
  const [upgrading, setUpgrading] = useState(false);
  const [errText, setErrText] = useState("");

  // cancel button state
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // ---------- “Should we show Start paid now?” ----------
  // Prefer Mantle for trial status if present
  const mantleTrialEndsAt = customer?.activeSubscription?.trialEndsAt
    ? new Date(customer.activeSubscription.trialEndsAt)
    : null;
  const mantleTrialing = Boolean(mantleTrialEndsAt && mantleTrialEndsAt > new Date());

  // Consider them fully paid if Mantle says active and not trialing
  const mantlePaidActive =
    customer?.activeSubscription?.status === "active" && !mantleTrialing;

  // Local cap check
  const capHit = (shop?.markedImagesCount ?? 0) >= TRIAL_CAP;

  // Prefer Mantle trial flag; otherwise fall back to “not paid + cap hit”
  const showStartPaidNow =
    mantleTrialing || (!mantlePaidActive && capHit);

  // Optional: only show if the “no trial” plan is actually present
  const hasNoTrialPlan = Boolean(plans?.some((p) => p.id === PRO_NO_TRIAL_ID));

  // const startPaidNow = async () => {
  //   setErrText("");
  //   setUpgrading(true);
  //   try {
  //     // 1) cancel current sub(s)
  //     const res = await api.fetch("/billing-cancel", { method: "POST" });
  //     const json = await res.json();
  //     if (!res.ok || json?.ok === false) {
  //       throw new Error(json?.message || "Cancel failed");
  //     }

  //     // 2) subscribe to Pro (no trial) by ID
  //     const plan = plans?.find((p) => p.id === PRO_NO_TRIAL_ID);
  //     if (!plan) throw new Error("Pro (no trial) plan not found");

  //     const sub = await subscribe({
  //       planId: plan.id,
  //       returnUrl: "/plans?post=upgrade",
  //     });

  //     if (sub?.error) throw new Error(String(sub.error));
  //     if (sub?.confirmationUrl) {
  //       open(sub.confirmationUrl, "_top");
  //     } else {
  //       navigate("/plans");
  //     }
  //   } catch (e) {
  //     setErrText(e?.message || "Upgrade failed");
  //     console.error(e);
  //   } finally {
  //     setUpgrading(false);
  //   }
  // };
  const startPaidNow = async () => {
  setErrText("");
  setUpgrading(true);
  try {
    // 1) cancel current Mantle sub (if any)
    await cancelSubscription();

    // 2) subscribe to your no-trial plan
    const plan = plans?.find((p) => p.id === PRO_NO_TRIAL_ID);
    if (!plan) throw new Error("Pro (no trial) plan not found");

    const sub = await subscribe({
      planId: plan.id,
      returnUrl: "/plans?post=upgrade",
    });

    if (sub?.error) throw new Error(String(sub.error));
    if (sub?.confirmationUrl) {
      open(sub.confirmationUrl, "_top");
    } else {
      navigate("/plans");
    }
  } catch (e) {
    setErrText(e?.message || "Upgrade failed");
    console.error(e);
  } finally {
    setUpgrading(false);
  }
};


  // const cancel = async () => {
  //   setBusy(true);
  //   setErr("");
  //   try {
  //     const resp = await api.fetch("/billing-cancel", { method: "POST" });
  //     const json = await resp.json();
  //     if (!resp.ok || json?.ok !== true) {
  //       throw new Error(json?.message || "Cancel failed");
  //     }
  //     location.reload();
  //   } catch (e) {
  //     setErr(e.message || String(e));
  //   } finally {
  //     setBusy(false);
  //   }
  // };
  const cancel = async () => {
  setBusy(true);
  setErr("");
  try {
    await cancelSubscription();        // ⬅️ Mantle cancels the active sub
    // (Optional) also flip your local flag for instant gating:
    try { await api.fetch("/local-flags/mark-unpaid", { method: "POST" }); } catch {}
    location.reload();
  } catch (e) {
    setErr(e?.message || String(e));
  } finally {
    setBusy(false);
  }
};

  if (loading || fetchingShop) {
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
        {showStartPaidNow && hasNoTrialPlan && (
          <>
            <Button variant="primary" loading={upgrading} onClick={startPaidNow}>
              Start paid now (end trial early)
            </Button>
            {errText ? (
              <div style={{ marginTop: 8 }}>
                <InlineError fieldID="upgrade" message={errText} />
              </div>
            ) : null}
          </>
        )}

        <PlanCardStack
          cardType={PlanCardType.Highlighted}
          customer={customer}
          plans={plans}
          onSelectPlan={async ({ plan, discount }) => {
            const subscription = await subscribe({
              planId: plan.id,
              discountId: discount?.id,
              returnUrl: "/plans",
            });
            if (subscription?.error) {
              console.error("Unable to subscribe:", subscription.error);
              return;
            }
            if (subscription?.confirmationUrl) {
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
            You can also cancel by uninstalling the app from Shopify; that immediately ends the subscription.
          </Banner>
        </div>
      </Layout.Section>
    </Page>
  );
}
