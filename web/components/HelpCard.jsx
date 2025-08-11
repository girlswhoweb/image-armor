import { BlockStack, Button, Card, InlineStack, Text, Icon, Box, Badge } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import enTranslations from "../translations/en.json";
import { InviteMinor } from "@shopify/polaris-icons";

const HelpCard = () => {
  const [i18n] = useI18n({
    id: "AppData",
    fallback: enTranslations,
    translations: async function (locale) {
      try {
        // console.log("locale translations", locale);
        const dictionary = await import(`../translations/${locale}.json`);
        return dictionary.default;
      } catch (error) {
        console.log("error", error);
      }
    },
  });
  
  return (
    <Card>
      <BlockStack gap={400}>
        <BlockStack gap={400}>
          <InlineStack gap={200}>
            <Text variant="headingSm">
              <span style={{ color: '#d773aa' }}>
                {i18n.translate("AppData.HelpCard.needHelp")}
              </span>
            </Text>
            <Badge tone="info">{i18n.translate("AppData.HelpCard.freeSetup")}</Badge>
          </InlineStack>
          <Text variant="bodyMd">
            {i18n.translate("AppData.HelpCard.reachOut")}
          </Text>
        </BlockStack>
        <Box background="bg-fill-active" borderColor="border" borderWidth="025" borderRadius="200">
          <div style={{
            display: "grid",
            gridTemplate: "auto / repeat(2, 1fr)",
          }}>
            {/* <div style={{ padding: "var(--p-space-600)", borderRight: "1px solid var(--p-color-border)" }}>
              <BlockStack gap={200} align="start" inlineAlign="start">
                <InlineStack align="start" blockAlign="start" gap={150}>
                  <span>
                    <Icon
                      source={ConversationMinor}
                      // tone="base"
                      
                    />
                  </span>
                  <Text as="h3" variant="bodyMd" fontWeight="semibold">
                    {i18n.translate("AppData.HelpCard.liveChat")}
                  </Text>
                </InlineStack>
                <Text variant="bodyMd">
                  {i18n.translate("AppData.HelpCard.liveChatMsg")}
                </Text>
                <Button variant="primary" onClick={() => [window?.tidioChatApi?.open(), console.log("tidioChatApi", window?.tidioChatApi)]}>
                  {i18n.translate("AppData.HelpCard.chatNow")}
                </Button>
              </BlockStack>
            </div> */}
            <div style={{ padding: "var(--p-space-600)" }}>
            <BlockStack gap={200} align="start" inlineAlign="start">
              <InlineStack align="start" blockAlign="start" gap={150}>
                <span>
                  <Icon
                    source={InviteMinor}
                  />
                </span>
                <Text as="h3" variant="bodyMd" fontWeight="semibold">
                  {i18n.translate("AppData.HelpCard.email")}
                </Text>
              </InlineStack>
              <Text variant="bodyMd">
                {i18n.translate("AppData.HelpCard.emailMsg")}
              </Text>
              <Button 
                onClick={() => window.open("mailto:help@girlswhoweb.com", "_blank")}
                size="small"
              >
                {i18n.translate("AppData.HelpCard.sendEmail")}
              </Button>
            </BlockStack>
            </div>
          </div>
        </Box>
      </BlockStack>
    </Card>
  );
};

export default HelpCard;
