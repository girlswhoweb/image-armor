import {
  Button,
  Checkbox,
  LegacyCard,
  Text,
  TextField,
} from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { useState } from "react";

export default function AltTextCard({ appSettings, setAppSettings }) {
  const [localAltText, setLocalAltText] = useState(appSettings?.altFormat);

  const [i18n] = useI18n({ id: "AppData"});

  return (
    <div>
      <Checkbox
        label={<Text variant="headingLg">SEO Alt Text</Text>}
        checked={appSettings.altTextEnabled}
        onChange={() =>
          setAppSettings({
            ...appSettings,
            altTextEnabled: !appSettings.altTextEnabled,
          })
        }
      />
      {appSettings?.altTextEnabled && (
        <>
          <TextField
            label="Available Variables: [product_name], [product_type], [vendor], [tags]"
            placeholder="[product_name] - [product_type] by [vendor] - [tags]"
            value={localAltText}
            onChange={(val) => setLocalAltText(val)}
            onBlur={() =>
              setAppSettings({ ...appSettings, altFormat: localAltText })
            }
            autoComplete="off"
            requiredIndicator={true}
          />
          <Checkbox
            checked={appSettings?.altOverwrite}
            onChange={(val) =>
              setAppSettings({ ...appSettings, altOverwrite: val })
            }
            label={i18n.translate("AppData.AltTextCard.overwrite")}
          />
          <Button
            onAction={() =>
              setAppSettings({
                ...appSettings,
                altFormat:
                  "[product_name] - [product_type] by [vendor] - [tags]",
              })
            }
          >
            {i18n.translate("AppData.AltTextCard.reset")}
          </Button>
        </>
      )}
    </div>
  );
}
