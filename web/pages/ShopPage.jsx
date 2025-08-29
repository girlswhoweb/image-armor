import { useFindFirst } from "@gadgetinc/react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Frame,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  Toast,
} from "@shopify/polaris";
import { api } from "../api";
import { useEffect, useRef, useState } from "react";
import HeaderCard from "../components/HeaderCard";
import DesignCard from "../components/DesignCard/index";
import OptimisationCard from "../components/OptimisationCard";
import SettingsCard from "../components/SettingsCard/index";
import PreviewCard from "../components/PreviewCard";
import { useI18n } from "@shopify/react-i18n";
import { ResetMinor, WandMinor } from "@shopify/polaris-icons";
import enTranslations from "../translations/en.json";
import Pricing from "../components/Pricing/index";
import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router-dom";
import HelpCard from "../components/HelpCard";

const ShopPage = () => {
  const [{ data, fetching, error }] = useFindFirst(api.shopSettings);
  const { isAuthenticated, loading } = useGadget();
  const shopify = useAppBridge();
  const navigate = useNavigate();
  
  const [language, _setLanguage] = useState(localStorage.getItem("supr-language") || "en");

  const [i18n] = useI18n({
    id: "AppData",
    fallback: enTranslations,
    translations: async function (locale) {
      try {
        const dictionary = await import(`../translations/${locale}.json`);
        return dictionary.default;
      } catch (error) {
        console.log("error", error);
      }
    },
  });

  const [initLoad, setInitLoad] = useState(true);
  const [activating, setActivating] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [showCompletedBanner, setShowCompletedBanner] = useState(true);
  const lastCompletedOpRef = useRef(null);
  const [shopSettingsId, setShopSettingsId] = useState("");
  const [appSettings, setAppSettings] = useState({
    isSaved: true,
    markType: "text",
    opacity: 50,
    position: "center",
    radioValue: "allProducts"
  });
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [starterPlanUser, setStarterPlanUser] = useState(false);
  const [starterPlanStartDate, setStarterPlanStartDate] = useState(null);
  const isStarterTrialActive = (() => {
  if (!starterPlanUser || !starterPlanStartDate) return false;
    const start = new Date(starterPlanStartDate);
    const now = new Date();
    const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7; // 7-day trial window
  })();
  const [isActive, setIsActive] = useState(false);
  const [isDifferent, setIsDifferent] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [processStatus, setProcessStatus] = useState({
    state: "IDEL", // IDEL, PROCESSING, UPLOADING, REMOVING, FAILED, LIMITED, COMPLETED
    operationId: null,
    lastAction: null,
    processCount: 0,
  });
  const [toastData, setToastData] = useState({
    isActive: false,
    message: "",
    error: false,
  });

  const [allowance, setAllowance] = useState({
    checked: false,
    inTrial: false,
    remaining: Infinity,
    isPaidUser: false,
  });

  async function loadAllowance() {
  try {
    const r = await api.fetch("/trial-allowance");
    const a = await r.json();

    // 🔧 force types
    const remainingNum = Number(a?.remaining);
    const parsedRemaining = Number.isFinite(remainingNum) ? remainingNum : Infinity;

    const next = {
      checked: true,
      inTrial: !!a?.inTrial,
      isPaidUser: !!a?.isPaidUser,
      remaining: parsedRemaining,
    };
    setAllowance(next);

    // Optional debug
    console.log("[trial-allowance]", a, "→ parsed", next);
  } catch (e) {
    // Don’t block the user; the server still enforces the cap
    setAllowance((s) => ({ ...s, checked: true }));
    console.warn("trial-allowance fetch failed", e);
  }
}

// Load once and also after processing finishes or when page becomes visible
// run once on mount
useEffect(() => {
  loadAllowance();
}, []);

// optionally reload after server-driven state changes
useEffect(() => {
  const s = (processStatus?.state || "").toUpperCase();
  if (["COMPLETED", "FAILED", "LIMITED"].includes(s)) {
    loadAllowance();
  }
}, [processStatus?.state]);


const limited = (processStatus?.state?.toUpperCase?.() === "LIMITED");

useEffect(() => {
  if (!limited) return;
  if (!allowance.checked) return;

  // If we’re not in trial anymore OR we are paid, clear LIMITED
  if (!allowance.inTrial || allowance.isPaidUser) {
    (async () => {
      try {
        await api.shopSettings.update(shopSettingsId, {
          processStatus: {
            ...processStatus,
            state: "IDEL",
            updatedAt: new Date().toISOString()
          }
        });
        setProcessStatus(ps => ({ ...ps, state: "IDEL" }));
      } catch (e) {
        console.warn("Failed to clear LIMITED locally", e);
      }
    })();
  }
}, [
  limited,
  allowance.checked,
  allowance.inTrial,
  allowance.isPaidUser,
  shopSettingsId,
  processStatus
]);

const noAllowance =
  allowance.checked &&
  !allowance.isPaidUser &&
  allowance.inTrial &&
  Number(allowance.remaining) <= 0;



  // Re-open banner for each NEW COMPLETED run (even if user dismissed the previous one)
  useEffect(() => {
    const state = processStatus?.state?.toUpperCase?.();
    if (state !== "COMPLETED") return;

    const op = processStatus?.operationId || String(processStatus?.updatedAt || "");
    if (!op) return;

    // only when a *new* completion arrives
    if (lastCompletedOpRef.current !== op) {
      lastCompletedOpRef.current = op;
      setShowCompletedBanner(true); // <-- key line
    }
  }, [processStatus?.state, processStatus?.operationId, processStatus?.updatedAt]);


  // Ask for a review *after* successful processing
  useEffect(() => {
    const state = processStatus?.state?.toUpperCase?.();
    if (!shopify) return;
    if (state !== "COMPLETED") return;

    (async () => {
      try {
        const result = await shopify.reviews.request();
        if (!result?.success) {
          console.log(`Review modal not displayed. Reason: ${result?.code}: ${result?.message}`);
        }
      } catch (err) {
        console.error("Error requesting review:", err);
      }
    })();
  }, [processStatus?.state, shopify]);


  async function saveSettings() {
    setToastData({ isActive: true, message: "Updating...", error: false });
    await api.shopSettings.update(shopSettingsId, {
      data: { ...appSettings, isSaved: true },
      isDifferent: true,
    });
    setIsDifferent(true);
    setAppSettings({...appSettings, isSaved: true});
    setToastData({ isActive: true, message: "Settings saved", error: false });
  }

  const setLanguage = (language) => {
    localStorage.setItem("supr-language", language);
    _setLanguage(language);
    window.location.reload();
  }

  useEffect(() => {
    if (!fetching) {
      if (data) {
        setInitLoad(true);
        setIsActive(data.isActive);
        setIsDifferent(data.isDifferent);
        setAppSettings(data.data);
        setIsPaidUser(data.isPaidUser);
        setStarterPlanUser(!!data.starterPlanUser);
        setStarterPlanStartDate(data.starterPlanStartDate ?? null);        
        setShopSettingsId(data.id);
        if(data.processStatus){
          setProcessStatus(data.processStatus);
        }
      }
    }
  }, [fetching]);

  useEffect(() => {
    if(processStatus && processStatus.state === "CHARGE"){
      window.open(processStatus.confirmationUrl, "_blank");
    }
  }, [processStatus]);

  // Check for status update every 5 seconds if processing
  useEffect(() => {
    if (fetching) return
    if (["PROCESSING", "REMOVING", "UPLOADING"].includes(processStatus?.state?.toUpperCase())) {
      const interval = setInterval(async () => {
        if (!data?._shopId) return;
        const fresh = await api.shopSettings.findByShopId(data._shopId);
        if (fresh?.processStatus) {
          setProcessStatus(fresh.processStatus);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [processStatus?.state, fetching, data?._shopId]);

  useEffect(() => {
    if (initLoad) {
      setInitLoad(false);
      return;
    }
    console.log("appSettings", appSettings?.isSaved);
  }, [appSettings]);

  const onApply = async ({ skipCharge = false }) => {
  await shopify.saveBar.leaveConfirmation();
  setToastData({ isActive: true, message: `${i18n.translate("AppData.General.Updating")}...`, error: false });

  try {
    // 🔎 Preflight trial allowance
    const r = await api.fetch("/trial-allowance");
    const a = await r.json();
    
    // keep UI state in sync with server result
    const remainingNum = Number(a?.remaining);
    setAllowance({
      checked: true,
      inTrial: !!a?.inTrial,
      isPaidUser: !!a?.isPaidUser,
      remaining: Number.isFinite(remainingNum) ? remainingNum : Infinity,
    });

    if (r.ok && a?.inTrial && !a.isPaidUser) {
      if (!Number.isFinite(a.remaining) || a.remaining <= 0) {
        // No allowance left → immediately show LIMITED + push to Plans
        setProcessStatus({ state: "LIMITED", updatedAt: new Date().toISOString() });
        setToastData({ isActive: true, message: i18n.translate("AppData.HeaderCard.limitedMsg"), error: false });
        navigate("/plans"); // or setShowPricing(true) if you have a pricing modal
        return; // ⛔ stop here, don’t start processing
      } else {
        // Optional: tell them we’ll only process up to the remaining images
        setToastData({
          isActive: true,
          message: `Trial limit: we’ll process up to ${a.remaining} images.`,
          error: false
        });
      }
    }
  } catch (e) {
    // If the preflight fails, you can choose to proceed or block.
    // I'd proceed, since your server still enforces the cap.
    console.warn("trial-allowance preflight failed", e);
  }

  
  // Gate ONLY if not paid AND not in (Shopify) trial
  // use the fresh preflight result `a` rather than possibly-stale state
  if (skipCharge === false && !(allowance.isPaidUser || allowance.inTrial || isStarterTrialActive)) {
    shopify.modal.show("accept-charge-model");
    return;
  }

  // 💥 Proceed with your existing processing flow
  setActivating(true);
  try {
    await api.shopSettings.update(shopSettingsId, {
      isActive: true,
      activeData: appSettings,
      isDifferent: false,
    });
    setIsActive(true);
    setIsDifferent(false);
    setToastData({ isActive: true, message: i18n.translate("AppData.General.Updated"), error: false });
    setProcessStatus({ state: "PROCESSING" });
  } catch (e) {
    setToastData({ isActive: true, message: "Something went wrong. Please try again or contact support.", error: true });
    setProcessStatus({ state: "FAILED" });
  } finally {
    setActivating(false);
  }
};


  const onRestore = async () => {
    setToastData({
      isActive: true,
      message: `${i18n.translate("AppData.General.Updating")}...`,
      error: false,
    });
    setRestoreLoading(true);
    try {
      await api.shopSettings.update(shopSettingsId, {
        isActive: false,
      });
      setIsActive(false);
      setToastData({
        isActive: true,
        message: i18n.translate("AppData.General.Updated"),
        error: false,
      });
      setProcessStatus({
        state: "REMOVING",
      });
    } catch (error) {
      setToastData({
        isActive: true,
        message: "Something went wrong. Please try again or contact support.",
        error: true,
      });
      setProcessStatus({
        state: "FAILED",
      });
    }
    setRestoreLoading(false);
  };


  const toastMarkup = toastData.isActive ? (
    <Toast
      content={toastData.message}
      error={toastData.error}
      onDismiss={() => setToastData({ isActive: false })}
      duration={2000}
    />
  ) : null;

  const handleSave = async() => {
    saveSettings();
  }
  
  const handleDiscard = () => {
    setAppSettings({ ...data.data, isSaved: true });
  }

  return (
    <Page
      title="Add Watermark & Optimise Images"
      backAction={{
        onAction: async () => {
          await shopify.saveBar.leaveConfirmation();
          navigate("/");
        }
      }}
      secondaryActions={[
        {
          content: ["REMOVING"].includes(processStatus?.state?.toUpperCase()) ? `${i18n.translate("AppData.HeaderCard.restoring")}...` : i18n.translate("AppData.HeaderCard.restore"),
          icon: ResetMinor,
          loading: restoreLoading,
          disabled: ["PROCESSING", "REMOVING"].includes(processStatus?.state?.toUpperCase()),
          destructive: true,
          onAction: onRestore
        }
      ]}
    >
      <style>
        {`
          .preview-empty > div {
            padding: 10px 0 0 0 !important;
          }
          .d-blocked{
            pointer-events: none;
            opacity: 0.5;
          }
        `}
      </style>
      <Frame>
        <div style={(loading || fetching || !appSettings) ? { opacity: 0.5, pointerEvents: "none" } : { opacity: 1 }}>
          <Layout>
            {/* Header Section */}
            {processStatus?.state?.toUpperCase() === "LIMITED" && (
              <Layout.Section>
                <Banner tone="warning">
                  {i18n.translate("AppData.HeaderCard.limitedMsg")}
                  <Button onClick={() => navigate("/plans")} size="large">
                    Upgrade Now
                  </Button>
                </Banner>
              </Layout.Section>
            )}

            {processStatus?.state?.toUpperCase() === "FAILED" && <Layout.Section>
              <Banner tone="critical">
                {i18n.translate("AppData.HeaderCard.failedMsg")}
              </Banner>
            </Layout.Section>}
            {processStatus?.state?.toUpperCase() === "COMPLETED" && showCompletedBanner && 
              <Layout.Section>
                <Banner tone="success" title={i18n.translate("AppData.HeaderCard.completedSuccessfully")} onDismiss={() => setShowCompletedBanner(false)}>
                  {i18n.translate("AppData.HeaderCard.completedMsg")}
                  {processStatus.updatedAt &&
                    `${i18n.translate(
                      "AppData.HeaderCard.lastUpdated"
                    )} ${new Date(
                      processStatus.updatedAt
                    ).toLocaleString()}`}
                </Banner>
              </Layout.Section>
            }
            <HeaderCard
              shopSettingsId={shopSettingsId}
              isPaidUser={isPaidUser}
              isDifferent={isDifferent}
              setIsDifferent={setIsDifferent}
              isActive={isActive}
              setIsActive={setIsActive}
              setToastData={setToastData}
              appSettings={appSettings}
              setShowPricing={setShowPricing}
              processStatus={processStatus}
              setProcessStatus={setProcessStatus}
              loading={loading || fetching || !appSettings}
            />
            <SaveBar id="save-settings" open={appSettings?.isSaved !== true}>
              <button variant="primary" onClick={handleSave}>Save & Preview</button>
              <button onClick={handleDiscard}>Discard</button>
            </SaveBar>
            {/* Main Section */}
            <Layout.Section>
              <Layout fullWidth>
                <Layout.Section>
                  <div className="quik-tabs">
                    <div style={{ marginBottom: "var(--p-space-400)" }}>
                      <Card>
                        <InlineStack align="space-between" blockAlign="center" wrap={false} gap="400">
                          <BlockStack>
                            <Text as="h2" variant="headingMd">
                              <span style={{ color: '#d773aa' }}>
                                Start Processing 👉
                              </span>
                            </Text>
                            <Text as="h3" variant="bodyMd" tone="subdued">Note: When you press Process Images, the app will apply your watermark and compression to all selected files. If you prefer to just keep a preview, click Save once you’ve set your options.</Text>
                          </BlockStack>
                          <BlockStack>
                            <Button variant="primary" onClick={onApply} icon={WandMinor} loading={activating} disabled={noAllowance || limited || ["PROCESSING", "REMOVING"].includes(processStatus?.state?.toUpperCase())}>{processStatus?.state?.toUpperCase() === "PROCESSING" ? `${i18n.translate("AppData.HeaderCard.processing")}...` : i18n.translate("AppData.HeaderCard.apply")}</Button>                            
                            {noAllowance && (
  <Button onClick={() => navigate("/plans")} tone="success">
    Upgrade to continue
  </Button>
)}
                          </BlockStack>
                        </InlineStack>
                      </Card>
                    </div>
                    <BlockStack gap={400}>
                      <DesignCard
                        appSettings={appSettings}
                        setAppSettings={setAppSettings}
                        setToastData={setToastData}
                        shopUrl={data?.shopUrl}
                      />
                      <OptimisationCard
                        appSettings={appSettings}
                        setAppSettings={setAppSettings}
                      />
                    </BlockStack>
                  </div>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                  <div
                    className="preview-panel"
                    style={{ marginBottom: "var(--p-space-400)" }}
                  >
                    <PreviewCard
                      appSettings={appSettings}
                      setAppSettings={setAppSettings}
                    />
                  </div>
                  <SettingsCard
                    appSettings={appSettings}
                    setAppSettings={setAppSettings}
                    setToastData={setToastData}
                  />
                  <div
                    style={{ marginTop: "var(--p-space-400)" }}
                  >
                    <Card>
                      <Select
                        label="Language"
                        options={[
                          {label: "English", value: "en"},
                          {label: "Danish", value: "da"},
                          {label: "German", value: "de"},
                          {label: "French", value: "fr"},
                          {label: "Spanish", value: "es"},
                          {label: "Chinese (Simplified)", value: "zh-CN"}
                        ]}
                        onChange={(value) => setLanguage(value)}
                        value={language}
                      />
                    </Card>
                  </div>
                </Layout.Section>
              </Layout>
            </Layout.Section>
            <Layout.Section>
              <HelpCard />
            </Layout.Section>
            <Layout.Section></Layout.Section>
          </Layout>
          <Pricing open={showPricing} />
        </div>
        {toastMarkup}
      </Frame>
    </Page>
  );
};

export default ShopPage;
