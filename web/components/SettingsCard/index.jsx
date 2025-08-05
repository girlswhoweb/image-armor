import { Checkbox, Card, BlockStack } from "@shopify/polaris";
import React, { useState } from "react";
import SettingMainChoice from "./SettingMainChoice";
import { useI18n } from "@shopify/react-i18n";
import { useGadget } from "@gadgetinc/react-shopify-app-bridge";

export default function SettingsCard({ appSettings, setAppSettings }) {
  const { appBridge } = useGadget();
  // const [showProdPicker, setShowProdPicker] = useState({
  //   show: false,
  //   type: "Collection",
  // });

  const [i18n] = useI18n({ id: "AppData"});

  const onSelection = async (action) => {
    if (action.type === "Product"){
      onProdSelection()
    }
    if (action.type === "Collection") {
      onCollectionSelection();
    }
  };

  const onProdSelection = async() => {
    const resourcePicker = await appBridge.resourcePicker({type: 'product', multiple: true, selectionIds: appSettings?.selectedProducts || []})
    if (resourcePicker?.length) {
      setAppSettings({
        ...appSettings,
        selectedProducts: resourcePicker.map((item) => {
          return { id: item.id };
        }),
        isSaved: false
      });
    }
  };

  const onCollectionSelection = async () => {
    const resourcePicker = await appBridge.resourcePicker({type: 'collection', multiple: true, selectionIds: appSettings?.selectedCollections || []})
    if (resourcePicker?.length) {
      setAppSettings({
        ...appSettings,
        selectedCollections: resourcePicker.map((item) => {
          return { id: item.id };
        }),
        isSaved: false
      });
    }
  };

  const handleFeaturedOnly = (newChecked) => {
    setAppSettings({
      ...appSettings,
      featuredOnly: newChecked,
      isSaved: false
    });
  };

  const handleAutoApply = (newChecked) => {
    setAppSettings({
      ...appSettings,
      autoApply: newChecked,
      isSaved: false
    });
  };

  return (
    <>
      <Card title={i18n.translate("AppData.SettingsCard.settings")}>
        <BlockStack gap="100">
          <SettingMainChoice
            setShowPicker={onSelection}
            appSettings={appSettings}
            setAppSettings={setAppSettings}
          />
          <Checkbox
            checked={appSettings?.featuredOnly}
            onChange={handleFeaturedOnly}
            label={i18n.translate("AppData.SettingsCard.featuredOnly")}
          />
          {/* {appSettings?.radioValue === "allProducts" && 
            <Checkbox
              checked={appSettings?.radioValue === "allProducts" && appSettings?.autoApply}
              onChange={handleAutoApply}
              label={i18n.translate("AppData.SettingsCard.autoApply")}
            />
          } */}
        </BlockStack>
      </Card>
      {/* {showProdPicker.type === "Product" && (
        )} */}
      {/* <ResourcePicker
        resourceType="Product"
        open={showProdPicker.show && showProdPicker.type === "Product"}
        onCancel={() => setShowProdPicker({ show: false })}
        onSelection={onProdSelection}
        initialSelectionIds={appSettings?.selectedProducts}
      />
      <ResourcePicker
        resourceType="Collection"
        open={showProdPicker.show && showProdPicker.type === "Collection"}
        onCancel={() => setShowProdPicker({ show: false })}
        onSelection={onCollectionSelection}
        initialSelectionIds={appSettings?.selectedCollections}
      /> */}
    </>
  );
}
