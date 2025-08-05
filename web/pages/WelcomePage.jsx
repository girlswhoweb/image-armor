import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { useFindFirst } from "@gadgetinc/react";
import { Banner, BlockStack, Button, CalloutCard, Card, InlineStack, Layout, Page, Spinner, Text } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { Onboarding } from "../components/Onboarding";
import HelpCard from "../components/HelpCard";
import { api } from "../api";
import CustomButton from "../components/Buttons/CustomButton";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { appBridge } = useGadget();
  const [{ data: shopData, fetching: fetchingShop, error: shopError }] = useFindFirst(api.shopifyShop, {
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
              <Text variant="headingXl"><span style={{ color: '#d773aa' }}>Welcome 👋</span></Text>
              <Text variant="bodyLg">ImageArmor: Anti-theft Watermark</Text>
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
                    Protect your Images: Add Watermark and Optimise
                  </span>
                </Text>
                <Text variant="bodyMd" tone="subdued">Add logo or text watermark to protect your store & optimise page load time with image compression.</Text>
              </BlockStack>
              <InlineStack align="start" blockAlign="start">
                <CustomButton onClick={() => navigate("/watermark")}>Add Watermark & Optimise</CustomButton>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section><HelpCard /></Layout.Section>
        <Layout.Section></Layout.Section>
      </Layout>
    </Page>
  )
}