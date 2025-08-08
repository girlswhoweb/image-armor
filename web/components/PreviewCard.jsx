import { BlockStack, Button, Card, EmptyState, InlineGrid, LegacyCard, Spinner, Text } from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import prettyBytes from "pretty-bytes";
import { api } from "../api";
import { useI18n } from "@shopify/react-i18n";
import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import CustomButton from "./Buttons/CustomButton";

export default function PreviewCard({ appSettings, setAppSettings }) {
  const [i18n] = useI18n({ id: "AppData"});
  const { appBridge } = useGadget();

  const [previewProductId, setPreviewProductId] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sourceSize, setSourceSize] = useState(0);
  const [outputSize, setOutputSize] = useState(0);

  const onSelection = async () => {
    const resourcePicker = await appBridge.resourcePicker({type: 'product'})
    if(resourcePicker?.length){
      const productId = resourcePicker[0].id
      setPreviewProductId(productId)
    }
  };

  const onPreview = async () => {
    setLoading(true);
    if (appSettings?.markType === "image" && appSettings?.logoUrl == "") {
      return;
    }
    const previewUrl = new URL(window.location.origin + "/preview");
    previewUrl.searchParams.append("productId", previewProductId);
    if (appSettings?.optimisationEnabled) {
      const compression = appSettings?.compression;
      const compressionValue =
        40 + (40 - (40 * parseInt(compression, 10)) / 100);
      previewUrl.searchParams.append("quality", parseInt(compressionValue, 10));
    } else {
      previewUrl.searchParams.append("quality", 70);
    }
    if (appSettings?.watermarkEnabled) {
      previewUrl.searchParams.append("type", appSettings?.markType);
      previewUrl.searchParams.append("position", appSettings?.position);
      previewUrl.searchParams.append("opacity", appSettings?.opacity);
      previewUrl.searchParams.append(
        "layout",
        appSettings?.gridEnabled ? "grid" : "single"
      );
      if (appSettings?.markType === "text") {
        previewUrl.searchParams.append("text", appSettings?.textInput);
        previewUrl.searchParams.append("style", appSettings?.fontStyle);
        previewUrl.searchParams.append("size", appSettings?.fontSize);
        if(typeof appSettings?.textColor !== "undefined"){
          previewUrl.searchParams.append("textColor", appSettings?.textColor);
        }
      } else if (appSettings?.markType === "image") {
        previewUrl.searchParams.append("watermark", appSettings?.logoUrl);
        previewUrl.searchParams.append("width", appSettings?.imageWidth);
      }
      if (appSettings?.gridRotated) {
        previewUrl.searchParams.append("rotated", "true");
      }
    }
    
    const imageRes = await api.fetch(previewUrl.href, {
      method: "GET",
      headers: { 'Accept': '*/*' }
    })
    if (imageRes.status === 200) {
      const contentType = imageRes.headers.get("content-type")
      const imageData = await imageRes.arrayBuffer()
      const blob = new Blob([imageData], { type: contentType });
      const url = URL.createObjectURL(blob);
      setPreviewImage(url);
      const outputSize = imageRes.headers.get("Content-Length")
      setOutputSize(outputSize);

      // Original image
      const originalImg = imageRes.headers.get("original-image");
      await getSourceImage(originalImg);
    }

    setLoading(false);
  };

  const getSourceImage = async (sourceUrl) => {
    // Get Source Image
    const sourceRes = await fetch(sourceUrl);
    if (sourceRes.status === 200) {
      const outputSize = sourceRes.headers.get("content-length");
      setSourceSize(outputSize);
    }
  };

  useEffect(() => {
    if (previewProductId) {
      onPreview();
      console.log("Previewing for product ID:", previewProductId);
    }  
  }, [
    previewProductId,
    JSON.stringify(
      Object.fromEntries(
        Object.entries(appSettings || {}).filter(
          ([key]) =>
            ![
              "isSaved",
              "altFormat",
              "altOverwrite",
              "altTextEnabled",
              "selectedCollections",
              "selectedProducts",
              "featuredOnly",
              "radioValue",
            ].includes(key)
        )
      )
    ),
  ]);

  return (
    <div className="preview-card">
      <Card>
      <BlockStack gap="200">
        <InlineGrid columns="1fr auto">
          <Text as="h2" variant="headingSm">
            {previewProductId != "" && i18n.translate("AppData.PreviewCard.title")}
          </Text>
          {previewProductId != "" && 
            <Button
              onClick={onSelection}
              accessibilityLabel={i18n.translate("AppData.PreviewCard.changePreviewProduct")}
              variant="plain"
              // icon={PlusIcon}
            >
              {i18n.translate("AppData.PreviewCard.changePreviewProduct")}
            </Button>
          }
        </InlineGrid>
        {previewProductId == "" && (
          <div className="preview-empty">
            <EmptyState heading={i18n.translate('AppData.PreviewCard.selectProductLong')}>
              <CustomButton onClick={onSelection} size="small">
                {i18n.translate('AppData.PreviewCard.selectProduct')}
              </CustomButton>
            </EmptyState>
          </div>
        )}
        {!loading && (
          <>
            {previewProductId != "" && appSettings?.optimisationEnabled && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <div>
                  <strong>{i18n.translate("AppData.PreviewCard.original")}:</strong>{" "}
                  {prettyBytes(parseInt(sourceSize, 10) || 0)}
                </div>
                <div>
                  <strong>{i18n.translate("AppData.PreviewCard.compressed")}:</strong>{" "}
                  {prettyBytes(Math.min(parseInt(outputSize, 10), parseInt(sourceSize, 10)) || 0)}
                  {parseInt(outputSize, 10) < parseInt(sourceSize, 10) && 
                    ` (-${((parseInt(sourceSize, 10) - parseInt(outputSize, 10)) / parseInt(sourceSize, 10) * 100).toFixed(2)}%)`
                  }
                </div>
              </div>
            )}
            {previewProductId != "" && previewImage && (
              <img
                src={previewImage}
                style={{
                  width: "100%",
                  borderRadius: "var(--p-border-radius-2)",
                }}
              />
            )}
          </>
        )}
        {loading && previewProductId != "" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "40vh",
            }}
          >
            <Spinner />
          </div>
        )}
      </BlockStack>
      </Card>
    </div>
  );
}
