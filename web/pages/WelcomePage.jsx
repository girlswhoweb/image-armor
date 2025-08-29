import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useFindFirst } from "@gadgetinc/react";
import { Banner, BlockStack, Button, Card, Frame, InlineStack, Layout, Page, Text, Modal, Toast } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Onboarding } from "../components/Onboarding";
import HelpCard from "../components/HelpCard";
import { api } from "../api";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { appBridge } = useGadget();
  const shopify = useAppBridge();
  const [{ data: shopData, fetching: fetchingShop, error: shopError }] = useFindFirst(api.shopSettings, {
    select: {
      id: true,
      markedImagesCount: true
    }
  });

  const [uninstallOpen, setUninstallOpen] = useState(false);
const [restoreLoading, setRestoreLoading] = useState(false);
const [toast, setToast] = useState({
  active: false,
  content: "",
  error: false
});

const dismissToast = useCallback(() => setToast((t) => ({ ...t, active: false })), []);

const redirectToAppsPage = async () => {
  // 1) Embedded Admin path via Gadget App Bridge (best path)
  try {
    if (appBridge?.redirect?.toAdminPath) {
      await appBridge.redirect.toAdminPath("/settings/apps");
      return;
    }
  } catch (e) {
    console.warn("App Bridge toAdminPath failed, falling back:", e);
  }

  // 2) Fallback: open Admin in a new tab using the ?shop param (works outside Admin preview)
  const shop = new URLSearchParams(window.location.search).get("shop"); // e.g. my-store.myshopify.com
  const url = shop
    ? `https://${shop}/admin/settings/apps`
    : `https://admin.shopify.com/store`; // generic landing if shop param missing
  window.open(url, "_blank", "noopener");
};


const handleRestoreAndUninstall = async () => {
  if (!shopData?.id) return;
  setRestoreLoading(true);
  try {
    // Just flip the flag; your backend will kick off the restore + update processStatus.
    await api.shopSettings.update(shopData.id, {
      isActive: false,
      processStatus: { state: "REMOVING", updatedAt: new Date().toISOString() }
    });

    setToast({ active: true, content: "Restoring originals… Opening uninstall page…" });
    setUninstallOpen(false);

    // Redirect to Shopify’s uninstall page
    redirectToAppsPage();
  } catch (e) {
    console.error("restore+uninstall failed", e);
    const msg = e?.errors?.[0]?.message || e?.message || "Something went wrong. Please try again or contact support.";
    setToast({ active: true, content: msg, error: true });
  } finally {
    setRestoreLoading(false);
  }
};



  return (
    <Page narrowWidth>
      <Frame>
      <Layout>
        <Layout.Section>
          <Card padding="400">
            <BlockStack>
              <Text variant="headingXl"><span style={{ color: '#d773aa' }}>Welcome to ImageArmor! 🛡️</span></Text>
              <Text variant="bodyLg">Watermark your product images with one click</Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        {shopData?.markedImagesCount >= 10 && (
          <Layout.Section>
            <Banner title="Enjoying ImageArmor?" tone="success">
              <p>
                You've protected {shopData.markedImagesCount} images with ImageArmor! If you're finding our app helpful, 
                we'd greatly appreciate if you could leave a review.
              </p>
              <BlockStack gap="300">
                <div style={{marginTop: "10px"}}>
                  <Button 
                    onClick={() => {
                      window.open("https://apps.shopify.com/imagearmor-anti-theft-watermark/reviews", "_blank");
                    }}
                    variant="primary"
                  >
                    Leave a Review
                  </Button>
                </div>
              </BlockStack>
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section>
          <BlockStack gap="400">
            <Onboarding />
            {/* <StatsCard /> */}
          </BlockStack>
        </Layout.Section>
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text variant="headingMd">
                  <span style={{ color: '#d773aa' }}>
                    Secure & Speed Up Your Store Images
                  </span>
                </Text>
                <Text variant="bodyMd" tone="subdued">Add a custom logo or text watermark to deter image theft — and automatically compress files for lightning-fast page loads.</Text>
              </BlockStack>
              <InlineStack align="start" blockAlign="start">
                <Button onClick={() => navigate("/watermark")} variant="primary" size="large">Add Watermark & Optimise Images</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section><HelpCard /></Layout.Section>
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text variant="headingMd">
                  <span style={{ color: '#d773aa' }}>
                    Manage Your Subscription
                  </span>
                </Text>
                <Text variant="bodyMd" tone="subdued">View and manage your subscription details, including billing information and plan changes.</Text>
              </BlockStack>
              <InlineStack align="start" blockAlign="start">
                <Button
                  onClick={() => navigate("/plans")}
                  size="large"
                >
                  Plans & billing
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
  <Card padding="400" tone="critical">
    <BlockStack gap="400">
      <BlockStack gap="200">
        <Text variant="headingMd"><span style={{ color: '#d773aa' }}>Uninstall ImageArmor</span></Text>
        <Text variant="bodyMd" tone="subdued">
          This will first start restoring your watermarked images back to their originals. 
          Then you'll be taken to Shopify to remove the app.
        </Text>
      </BlockStack>
      <InlineStack align="start" blockAlign="start">
        <Button tone="critical" onClick={() => setUninstallOpen(true)}>
          Restore images & uninstall
        </Button>
      </InlineStack>
    </BlockStack>
  </Card>
</Layout.Section>

<Modal
  open={uninstallOpen}
  onClose={() => setUninstallOpen(false)}
  title="Restore images & uninstall?"
  primaryAction={{
    content: restoreLoading ? "Restoring…" : "Restore & uninstall",
    destructive: true,
    loading: restoreLoading,
    onAction: handleRestoreAndUninstall
  }}
  secondaryActions={[{ content: "Cancel", onAction: () => setUninstallOpen(false) }]}
>
  <Modal.Section>
    <Text as="p">
      We’ll begin restoring your images in the background. You’ll then be redirected to the Shopify
      “Apps and sales channels” page where you can remove ImageArmor.
    </Text>
    <Text as="p" tone="subdued" variant="bodySm" style={{ marginTop: 8 }}>
      Note: Shopify doesn’t let apps uninstall themselves automatically — removal is done on the Shopify page.
    </Text>
  </Modal.Section>
</Modal>

{toast.active && (
  <Toast content={toast.content} error={toast.error} onDismiss={dismissToast} duration={3000} />
)}
        
      </Layout>
      </Frame>
    </Page>
  )
}