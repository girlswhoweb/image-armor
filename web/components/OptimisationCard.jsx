import {
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  RangeSlider,
  Text,
} from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";

export default function OptimisationCard({ appSettings, setAppSettings }) {

  const [i18n] = useI18n({ id: "AppData"});

  return (
    <Card padding="0">
      <Box padding="400">
        <Checkbox
          label={<Text variant="headingLg"><span style={{ color: '#d773aa' }}>{i18n.translate("AppData.OptimisationCard.title")}</span></Text>}
          checked={appSettings?.optimisationEnabled}
          onChange={() =>
            setAppSettings({
              ...appSettings,
              optimisationEnabled: !appSettings?.optimisationEnabled,
            })
          }
        />
        <Text variant="bodyMd">
          {i18n.translate("AppData.OptimisationCard.subtitle")}
        </Text>      
      </Box>
      <Divider />
      <div className={appSettings?.optimisationEnabled ? "" : "d-blocked"}>
        <Box padding="400">
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm" fontWeight="medium">
              <span style={{ color: '#d773aa' }}>                
                {i18n.translate("AppData.OptimisationCard.compression") + " %"}
              </span>
            </Text>
            <RangeSlider
              min={0}
              max={100}
              value={appSettings?.compression}
              onChange={(val) =>
                setAppSettings({
                  ...appSettings,
                  isSaved: false,
                  compression: val,
                })
              }
              onBlur={(e) =>
                setAppSettings({
                  ...appSettings,
                  isSaved: false,
                  compression: e.target.value,
                })
              }
              output
              prefix={i18n.translate("AppData.OptimisationCard.min")}
              suffix={i18n.translate("AppData.OptimisationCard.max")}
            />
            <BlockStack inlineAlign="start">
              <Button
                onClick={() =>
                  setAppSettings({
                    ...appSettings,
                    compression: 35,
                    isSaved: false,
                  })
                }
              >
                {i18n.translate("AppData.OptimisationCard.setToDefault")}
              </Button>
            </BlockStack>
          </BlockStack>
        </Box>    
      </div>
    </Card>
  );
}
