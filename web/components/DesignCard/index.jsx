import React, { Suspense, lazy, useEffect, useState } from "react";
import { Box, Card, Checkbox, Divider, Text } from "@shopify/polaris";
import PreviewForm from "./PreviewForm";
import { useI18n } from "@shopify/react-i18n";

export default function DesignCard({
  appSettings,
  setAppSettings,
  setToastData,
  shopUrl
}) {
  const [files, setFiles] = useState();

  const [i18n] = useI18n({ id: "AppData"});

  return (
    <Card padding="0">
      <Box padding="400">
        <Checkbox
          label={<Text variant="headingLg"><span style={{ color: '#d773aa' }}>{i18n.translate("AppData.WatermarkCard.title")}</span></Text>}
          checked={appSettings?.watermarkEnabled}
          onChange={() =>
            setAppSettings({
              ...appSettings,
              watermarkEnabled: !appSettings.watermarkEnabled,
            })
          }
        />
      </Box>
      <Divider />
      <div className={appSettings?.watermarkEnabled ? "" : "d-blocked"}>
        <PreviewForm
          files={files}
          setFiles={setFiles}
          appSettings={appSettings}
          setAppSettings={setAppSettings}
          setToastData={setToastData}
          shopUrl={shopUrl}
        />
      </div>
      {/* {typeof appSettings?.watermarkEnabled === "undefined" ? true : appSettings.watermarkEnabled && (
      )} */}
    </Card>
  );
}
