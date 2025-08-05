import { Button, RadioButton, BlockStack, InlineStack } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import CustomButton from "../Buttons/CustomButton";

export default function SettingMainChoice({
  setShowPicker,
  appSettings,
  setAppSettings,
}) {
  const [i18n] = useI18n({ id: "AppData"});

  const handleChange = (_checked, newValue) => {
    setAppSettings({
      ...appSettings,
      radioValue: newValue,
      isSaved: false
    });
  };
  return (
    <>
      <BlockStack gap="100">
        <RadioButton
          label={i18n.translate("AppData.SettingsCard.applySelectedProducts")}
          helpText={
            appSettings?.radioValue === "selectedProducts" && (
              <div>
                <p style={{ marginBottom: "5px" }}>
                  {i18n.translate("AppData.SettingsCard.testNote")}
                </p>
                <InlineStack blockAlign="start" gap="200">
                  {/* <Button
                    onClick={() =>
                      setShowPicker({ show: true, type: "Product" })
                    }
                  >
                    {i18n.translate("AppData.SettingsCard.selectProducts")}
                  </Button> */}
                  <CustomButton
                    size="small"
                    onClick={() =>
                      setShowPicker({ show: true, type: "Product" })
                    }
                  >
                    {i18n.translate("AppData.SettingsCard.selectProducts")}
                  </CustomButton>
                  <div>
                    <div>{appSettings.selectedProducts.length} {i18n.translate("AppData.SettingsCard.selected")}</div>
                    {appSettings.selectedProducts.length > 0 && (
                      <div
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() =>
                          setAppSettings({
                            ...appSettings,
                            selectedProducts: [],
                            isSaved: false
                          })
                        }
                      >
                        {i18n.translate("AppData.SettingsCard.clear")}
                      </div>
                    )}
                  </div>
                </InlineStack>
              </div>
            )
          }
          checked={appSettings?.radioValue === "selectedProducts"}
          id="selectedProducts"
          name="selectedProducts"
          onChange={handleChange}
        />
        <RadioButton
          label={i18n.translate("AppData.SettingsCard.applySelectedCollections")}
          helpText={
            appSettings?.radioValue === "selectedCollections" && (
              <div>
                <p style={{ marginBottom: "5px" }}>
                  {i18n.translate("AppData.SettingsCard.testNote")}
                </p>
                <InlineStack blockAlign="start" gap="200">
                  <Button
                    onClick={() =>
                      setShowPicker({ show: true, type: "Collection" })
                    }
                  >
                    {i18n.translate("AppData.SettingsCard.selectCollections")}
                  </Button>
                  <div>
                    <div>{appSettings.selectedCollections.length} {i18n.translate("AppData.SettingsCard.selected")}</div>
                    {appSettings.selectedCollections.length > 0 && (
                      <div
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() =>
                          setAppSettings({
                            ...appSettings,
                            selectedCollections: [],
                            isSaved: false
                          })
                        }
                      >
                        {i18n.translate("AppData.SettingsCard.clear")}
                      </div>
                    )}
                  </div>
                </InlineStack>
              </div>
            )
          }
          id="selectedCollections"
          name="selectedCollections"
          checked={appSettings?.radioValue === "selectedCollections"}
          onChange={handleChange}
        />
        <RadioButton
          label={i18n.translate("AppData.SettingsCard.applyAll")}
          id="allProducts"
          name="allProducts"
          checked={appSettings?.radioValue === "allProducts"}
          helpText={
            appSettings?.radioValue === "allProducts" && (
              <div>
                <p style={{ marginBottom: "5px" }}>
                  {i18n.translate("AppData.SettingsCard.testNote")}
                </p>
              </div>
            )
          }
          onChange={handleChange}
        />
      </BlockStack>
    </>
  );
}
