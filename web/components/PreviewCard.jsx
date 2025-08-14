import { BlockStack, Button, Card, EmptyState, InlineGrid, Spinner, Text } from "@shopify/polaris";
import { useEffect, useState } from "react";
import prettyBytes from "pretty-bytes";
import { api } from "../api";
import { useI18n } from "@shopify/react-i18n";
import { useGadget } from "@gadgetinc/react-shopify-app-bridge";

export default function PreviewCard({ appSettings }) {
  const [i18n] = useI18n({ id: "AppData" });
  const { appBridge } = useGadget();

  const [previewProductId, setPreviewProductId] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // sizes in bytes
  const [sourceSize, setSourceSize] = useState(0);
  const [outputSize, setOutputSize] = useState(0);

  // UI flag: savings are below threshold (we’ll still show processed/with-watermark)
  const [noSavingsUI, setNoSavingsUI] = useState(false);

  // Only show “no savings” if processed is <5% smaller than original
  const MIN_SAVINGS = 0.05;

  const onSelection = async () => {
    const resourcePicker = await appBridge.resourcePicker({ type: "product" });
    if (resourcePicker?.length) {
      const productId = resourcePicker[0].id;
      setPreviewProductId(productId);
    }
  };

  // Map slider (0..100) -> quality (100..40)
  // slider 0 => q=100 (no compression); slider 100 => q=40 (strong)
  const sliderToQuality = (compression = 0) => {
    const c = Number(compression ?? 0);
    const q = Math.round(100 - (c * 60) / 100);
    return Math.max(40, Math.min(100, q));
  };

  const onPreview = async () => {
    setLoading(true);
    setNoSavingsUI(false);

    // guard for missing watermark image
    if (appSettings?.markType === "image" && !appSettings?.logoUrl) {
      setLoading(false);
      return;
    }

    const previewUrl = new URL(window.location.origin + "/preview");
    previewUrl.searchParams.append("productId", previewProductId);
    previewUrl.searchParams.append("t", String(Date.now())); // cache-bust

    const quality = appSettings?.optimisationEnabled
      ? sliderToQuality(appSettings?.compression)
      : 70;
    previewUrl.searchParams.append("quality", quality);

    if (appSettings?.watermarkEnabled) {
      previewUrl.searchParams.append("type", appSettings?.markType);
      previewUrl.searchParams.append("position", appSettings?.position);
      previewUrl.searchParams.append("opacity", appSettings?.opacity);
      previewUrl.searchParams.append("layout", appSettings?.gridEnabled ? "grid" : "single");

      if (appSettings?.markType === "text") {
        previewUrl.searchParams.append("text", appSettings?.textInput);
        previewUrl.searchParams.append("style", appSettings?.fontStyle);
        previewUrl.searchParams.append("size", appSettings?.fontSize);
        if (typeof appSettings?.textColor !== "undefined") {
          previewUrl.searchParams.append("textColor", appSettings?.textColor);
        }
      } else if (appSettings?.markType === "image") {
        previewUrl.searchParams.append("watermark", appSettings?.logoUrl);
        previewUrl.searchParams.append("width", appSettings?.imageWidth);
      }
      if (appSettings?.gridRotated) previewUrl.searchParams.append("rotated", "true");
    }

    try {
      const imageRes = await api.fetch(previewUrl.href, {
        method: "GET",
        headers: { Accept: "*/*" },
      });

      if (!imageRes.ok) {
        setPreviewImage(null);
        setOutputSize(0);
        setSourceSize(0);
        setNoSavingsUI(false);
        return;
      }

      // processed image (with watermark if enabled)
      const processedBuf = await imageRes.arrayBuffer();
      const contentType = imageRes.headers.get("content-type") || "application/octet-stream";
      const processedBlob = new Blob([processedBuf], { type: contentType });

      setPreviewImage(URL.createObjectURL(processedBlob));
      setOutputSize(processedBlob.size);

      // original size
      const originalUrl = imageRes.headers.get("original-image");
      if (originalUrl) {
        try {
          const srcRes = await fetch(originalUrl, { cache: "no-store" });
          if (srcRes.ok) {
            const srcBuf = await srcRes.arrayBuffer();
            const originalSize = srcBuf.byteLength;
            setSourceSize(originalSize);

            const savings = (originalSize - processedBlob.size) / originalSize;
            setNoSavingsUI(!(savings >= MIN_SAVINGS));
          } else {
            setSourceSize(0);
            setNoSavingsUI(false);
          }
        } catch {
          setSourceSize(0);
          setNoSavingsUI(false);
        }
      } else {
        setSourceSize(0);
        setNoSavingsUI(false);
      }
    } catch (e) {
      console.error("Preview fetch failed:", e);
      setPreviewImage(null);
      setOutputSize(0);
      setSourceSize(0);
      setNoSavingsUI(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (previewProductId) onPreview();
  }, [
    previewProductId,
    // rerun when relevant appSettings change (ignore noisy keys)
    JSON.stringify(
      Object.fromEntries(
        Object.entries(appSettings || {}).filter(([key]) => ![
          "isSaved",
          "altFormat",
          "altOverwrite",
          "altTextEnabled",
          "selectedCollections",
          "selectedProducts",
          "featuredOnly",
          "radioValue",
        ].includes(key))
      )
    ),
  ]);

  const percent =
    sourceSize > 0 && outputSize > 0
      ? Math.round(((sourceSize - outputSize) / sourceSize) * 10000) / 100
      : null;

  return (
    <div className="preview-card">
      <Card>
        <BlockStack gap="200">
          <InlineGrid columns="1fr auto">
            <Text as="h2" variant="headingSm">
              {previewProductId !== "" && i18n.translate("AppData.PreviewCard.title")}
            </Text>
            {previewProductId !== "" && (
              <Button
                onClick={onSelection}
                accessibilityLabel={i18n.translate("AppData.PreviewCard.changePreviewProduct")}
                variant="plain"
              >
                {i18n.translate("AppData.PreviewCard.changePreviewProduct")}
              </Button>
            )}
          </InlineGrid>

          {previewProductId === "" && (
            <div className="preview-empty">
              <EmptyState heading={i18n.translate("AppData.PreviewCard.selectProductLong")}>
                <Button onClick={onSelection} size="small">
                  {i18n.translate("AppData.PreviewCard.selectProduct")}
                </Button>
              </EmptyState>
            </div>
          )}

          {!loading && previewProductId !== "" && appSettings?.optimisationEnabled && (
  <div style={{ display: "flex", flexDirection: "column", marginBottom: 5 }}>
    <div>
      <strong>{i18n.translate("AppData.PreviewCard.original")}:</strong>{" "}
      {prettyBytes(sourceSize || 0)}
    </div>
    <div>
      <strong>
        {i18n.translate("AppData.PreviewCard.previewWithWatermark") || "Preview (with watermark)"}:
      </strong>{" "}
      {prettyBytes(outputSize || 0)}{" "}
      {/* Show % only when meaningful savings */}
      {percent !== null && percent >= 5 && !noSavingsUI && (
        <>(-{percent.toFixed(2)}%)</>
      )}
      {/* If no meaningful savings */}
      {percent !== null && (noSavingsUI || percent < 5) && (
        <em style={{ opacity: 0.7 }}>
          {" "}
          — {i18n.translate("AppData.PreviewCard.noSavingsKeptOriginal") || "No compression benefit – original image preserved"}
        </em>
      )}
      {/* If preview is bigger, add a gentle note */}
      {percent !== null && percent < 0 && (
        <em style={{ opacity: 0.7 }}>
          {" "}
          — {i18n.translate("AppData.PreviewCard.mayIncreaseWithWatermark") || "Includes watermark—file may be larger"}
        </em>
      )}
    </div>
  </div>
)}


          {!loading && previewProductId !== "" && previewImage && (
            <img
              src={previewImage}
              style={{ width: "100%", borderRadius: "var(--p-border-radius-2)" }}
              alt="Preview"
            />
          )}

          {loading && previewProductId !== "" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh" }}>
              <Spinner />
            </div>
          )}
        </BlockStack>
      </Card>
    </div>
  );
}
