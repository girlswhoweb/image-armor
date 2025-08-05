import { NoteMinor } from "@shopify/polaris-icons";
import { useState, useEffect } from "react";
import {
  DropZone,
  Thumbnail,
  Button,
  // LegacyStack,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { api } from "../../api";

export default function FileDropZone({
  files,
  setFiles,
  appSettings,
  setAppSettings,
  setToastData,
  shopUrl
}) {

  const [localLogo, setLocalLogo] = useState(appSettings?.logoUrl);

  useEffect(() => {
    if (appSettings.logoUrl && appSettings.logoKey) {
      setLocalLogo(appSettings.logoUrl);
    }
  }, [appSettings]);

  const handleDropZoneDrop = async (
    _dropFiles,
    acceptedFiles,
    _rejectedFiles
  ) => {
    try {
      if (!acceptedFiles[0]) {
        console.log("no file");
        return;
      }
      setToastData({ isActive: true, message: "Uploading...", error: false });
      const uploadLogoUrl = new URL(window.location.origin + "/upload-logo" + "?shop=" + shopUrl);
      const signedUploadUrl = await api.fetch(uploadLogoUrl.href, {
        method: "GET",
        headers: { 'Accept': '*/*' }
      }).then(res => res.json()).catch(err => console.log(err));
      // Upload file to AWS S3
      try {
        const response = await fetch(signedUploadUrl.url, {
          method: 'PUT',
          headers: {
            "Content-Type": "image/png",
          },
          body: acceptedFiles[0]
        });

        if (response.ok) {
          setToastData({
            isActive: true,
            message: "Uploaded Successfully",
            error: false,
          });
          const logoKey = shopUrl + "/uploads/logo.png";
          const logoUrl = "https://watermark-app.s3.amazonaws.com/" + logoKey;
          setAppSettings({ ...appSettings, logoUrl, logoKey });
        } else {
          throw new Error('Upload failed');
        }
      } catch (err) {
        setToastData({
          isActive: true,
          message: "Something Went Wrong! Contact Support",
          error: true,
        });
      }
    } catch (error) {
      setToastData({
        isActive: true,
        message: "Something Went Wrong! Contact Support",
        error: true,
      });
    }
  };

  const validImageTypes = ["image/jpeg", "image/png"];

  const fileUpload = !files && (
    <DropZone.FileUpload actionHint="Accepts .jpg and .png" />
  );

  const uploadedFiles = (files || localLogo) && (
    <BlockStack gap="200">
      <Thumbnail
        size="large"
        alt={files?.name}
        source={
          localLogo
            ? localLogo
            : validImageTypes.includes(files.type)
              ? window.URL.createObjectURL(files)
              : NoteMinor
        }
      />
      <div>
        {files?.name}
        {files?.size && <Text variant="bodySm">{files?.size} bytes</Text>}
        <div style={{ paddingTop: "var(--p-space-2)" }}>
          <Button
            onClick={() => [
              setFiles(),
              setLocalLogo(false),
              setAppSettings({
                ...appSettings,
                logoUrl: false,
                logoKey: false,
              }),
            ]}
          >
            Change
          </Button>
        </div>
      </div>
    </BlockStack>
  );

  return (
    <>
      {!localLogo && !files && (
        <DropZone
          allowMultiple={false}
          accept={validImageTypes}
          // label="Watermark Image"
          onDrop={handleDropZoneDrop}
          variableHeight
        >
          {uploadedFiles}
          {fileUpload}
        </DropZone>
      )}
      {uploadedFiles}
    </>
  );
}
