import { BlockStack, Box, Card, DescriptionList, InlineStack, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import enTranslations from "../translations/en.json";

const FAQ = () => {

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
              {i18n.translate("AppData.FAQ.title")}
            </Text>
          </InlineStack>
        </BlockStack>
        <Box background="bg-fill-active" borderColor="border" borderWidth="025" borderRadius="200" paddingInline="400">
          <DescriptionList
            items={[
              {
                term: 'Logistics',
                description:
                  'The management of products or other resources as they travel between a point of origin and a destination.',
              },
              {
                term: 'Sole proprietorship',
                description:
                  'A business structure where a single individual both owns and runs the company.',
              },
              {
                term: 'Discount code',
                description:
                  'A series of numbers and/or letters that an online shopper may enter at checkout to get a discount or special offer.',
              },
            ]}
          />
        </Box>
      </BlockStack>
    </Card>
  );
};

export default FAQ;

