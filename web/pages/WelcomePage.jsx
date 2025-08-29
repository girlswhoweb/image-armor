import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { useFindFirst } from "@gadgetinc/react";
import { Banner, BlockStack, Button, Card, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { Onboarding } from "../components/Onboarding";
import HelpCard from "../components/HelpCard";
import { api } from "../api";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { appBridge } = useGadget();
  const [{ data: shopData, fetching: fetchingShop, error: shopError }] = useFindFirst(api.shopSettings, {
    select: {
      id: true,
      markedImagesCount: true
    }
  });

  return (
    <Page narrowWidth>
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
        
      </Layout>
    </Page>
  )
}