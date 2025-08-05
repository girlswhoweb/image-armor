import {
  FormLayout,
  TextField,
  Button,
  RangeSlider,
  Listbox,
  Popover,
  AutoSelection,
  Checkbox,
  LegacyStack,
  Box,
  BlockStack,
  Text,
  Divider,
} from "@shopify/polaris";
import React, { useCallback, useState } from "react";
import FileDropZone from "./FileDropZone";
import { useI18n } from "@shopify/react-i18n";

function PreviewForm({
  files,
  setFiles,
  appSettings,
  setAppSettings,
  setToastData,
  shopUrl
}) {
  // Popover states
  const [showType, setShowType] = useState(false);
  const [showFont, setShowFont] = useState(false);
  const [showFontStyle, setShowFontStyle] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);
  const [localOpacity, setLocalOpacity] = useState(appSettings?.opacity || 0.5);
  const [localWidth, setLocalWidth] = useState(appSettings?.imageWidth || 50);
  const [localText, setLocalText] = useState(appSettings?.textInput || "");

  const [i18n] = useI18n({ id: "AppData"});

  const fontSize = [
    { label: i18n.translate("AppData.PreviewForm.fontSize.small"), value: "small" },
    { label: i18n.translate("AppData.PreviewForm.fontSize.medium"), value: "medium" },
    { label: i18n.translate("AppData.PreviewForm.fontSize.large"), value: "large" },
    { label: i18n.translate("AppData.PreviewForm.fontSize.xlarge"), value: "xlarge" },
  ];
  
  const fontStyle = [
    { label: i18n.translate("AppData.PreviewForm.fontStyle.basic"), value: "basic" },
    { label: i18n.translate("AppData.PreviewForm.fontStyle.cursive"), value: "cursive" },
    { label: i18n.translate("AppData.PreviewForm.fontStyle.print"), value: "print" },
    { label: i18n.translate("AppData.PreviewForm.fontStyle.classic"), value: "classic" },
  ];
  
  const optionsType = [
    { label: i18n.translate("AppData.PreviewForm.optionsType.text"), value: "text" },
    { label: i18n.translate("AppData.PreviewForm.optionsType.image"), value: "image" },
  ];
  
  const optionsPlacement = [
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.centerCenter"), value: "center" },
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.centerRight"), value: "centerRight" },
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.centerLeft"), value: "centerLeft" },
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.topCenter"), value: "topCenter" },
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.topRight"), value: "topRight" },
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.topLeft"), value: "topLeft" },
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.bottomCenter"), value: "bottomCenter" },
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.bottomRight"), value: "bottomRight" },
    { label: i18n.translate("AppData.PreviewForm.optionsPlacement.bottomLeft"), value: "bottomLeft" },
  ];
  

  const handleGridMode = (value) => {
    setAppSettings({ ...appSettings, gridEnabled: value, isSaved: false });
  };

  const handleGridRotated = (value) => {
    setAppSettings({ ...appSettings, gridRotated: value, isSaved: false });
  };

  const handleTextUpdate = (value) => {
    setAppSettings({ ...appSettings, textInput: value + "  ", isSaved: false });
    // setAppSettings({ ...appSettings, textInput: value.trim(), isSaved: true });
  }

  return (
    <>
      <Box>
        {/* Watermark Type */}
        <Box paddingBlock="400" paddingInline="400">
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm" fontWeight="medium">
              <span style={{ color: '#d773aa' }}>
                {i18n.translate("AppData.WatermarkCard.watermarkType")}
              </span>
            </Text>
            <Popover
              active={showType}
              activator={
                <Button
                  fullWidth
                  textAlign="left"
                  disclosure="select"
                  onClick={() => setShowType(!showType)}
                >
                  {
                    optionsType.find(
                      (option) => option.value === appSettings?.markType
                    )?.label
                  }
                </Button>
              }
              fullWidth
              sectioned
              fluidContent
              onClose={() => setShowType(!showType)}
            >
              <Listbox
                onSelect={(val) => {
                  setAppSettings({ ...appSettings, markType: val, isSaved: false });
                  setShowType(!showType);
                }}
                autoSelection={AutoSelection.None}
              >
                {optionsType.map((option, index) => (
                  <Listbox.Option
                    key={index}
                    value={option.value}
                    selected={option.value == appSettings?.markType}
                  >
                    {option?.label}
                  </Listbox.Option>
                ))}
              </Listbox>
            </Popover>
          </BlockStack>
        </Box>
        <Divider />
        {/* Watermark Image */}
        {appSettings?.markType === "image" && (
          <>
            <Box paddingBlock="400" paddingInline="400">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" fontWeight="medium">
                  {i18n.translate("AppData.WatermarkCard.watermarkImage")}
                </Text>
                <FileDropZone
                  files={files}
                  setFiles={setFiles}
                  appSettings={appSettings}
                  setAppSettings={setAppSettings}
                  setToastData={setToastData}
                  shopUrl={shopUrl}
                />
              </BlockStack>
            </Box>
            <Divider />
          </>
        )}
        {/* Opacity */}
        <Box paddingBlock="400" paddingInline="400">
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm" fontWeight="medium">
              <span style={{ color: '#d773aa' }}>
                {i18n.translate("AppData.WatermarkCard.opacity")}
              </span>
            </Text>
            <RangeSlider
              // label={i18n.translate("AppData.WatermarkCard.opacity")}
              value={appSettings?.opacity}
              onChange={(val) =>
                setAppSettings({ ...appSettings, isSaved: false, opacity: val, isSaved: false })
              }
              onBlur={(e) =>
                setAppSettings({
                  ...appSettings,
                  opacity: e.target.value,
                  isSaved: false,
                })
              }
              output
            />
          </BlockStack>
        </Box>
        <Divider />
        {/* Image Width */}
        {appSettings?.markType === "image" && (
          <>
            <Box paddingBlock="400" paddingInline="400">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" fontWeight="medium">
                  {i18n.translate("AppData.WatermarkCard.imageWidth")}
                </Text>
                <RangeSlider
                  value={appSettings?.imageWidth}
                  onChange={(val) =>
                    setAppSettings({
                      ...appSettings,
                      isSaved: false,
                      imageWidth: val,
                    })
                  }
                  onBlur={(e) =>
                    setAppSettings({
                      ...appSettings,
                      isSaved: false,
                      imageWidth: e.target.value,
                    })
                  }
                  output
                />
              </BlockStack>
            </Box>
            <Divider />
          </>
        )}
        {/* Font Style */}
        {appSettings?.markType === "text" && (
          <>
            <Box paddingBlock="400" paddingInline="400">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" fontWeight="medium">
                  <span style={{ color: '#d773aa' }}>
                    {i18n.translate("AppData.WatermarkCard.fontStyle")}
                  </span>
                </Text>
                <Popover
                  active={showFontStyle}
                  activator={
                    <Button
                      fullWidth
                      textAlign="left"
                      disclosure="select"
                      onClick={() => setShowFontStyle(!showFont)}
                    >
                      {
                        fontStyle.find(
                          (option) =>
                            option.value === (appSettings?.fontStyle || "basic")
                        )?.label
                      }
                    </Button>
                  }
                  fullWidth
                  sectioned
                  onClose={() => setShowFontStyle(!showFontStyle)}
                >
                  <Listbox
                    onSelect={(val) => [
                      setAppSettings({ ...appSettings, fontStyle: val, isSaved: false }),
                      setShowFontStyle(false),
                    ]}
                    autoSelection={AutoSelection.None}
                  >
                    {fontStyle.map((option, index) => (
                      <Listbox.Option
                        key={index}
                        value={option.value}
                        selected={
                          option.value === (appSettings?.fontStyle || "basic")
                        }
                      >
                        {option?.label}
                      </Listbox.Option>
                    ))}
                  </Listbox>
                </Popover>
              </BlockStack>
            </Box>
            <Divider />
          </>
        )}
        {/* Text Input */}
        {appSettings?.markType === "text" && (
          <>
            <Box paddingBlock="400" paddingInline="400">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" fontWeight="medium">
                  <span style={{ color: '#d773aa' }}>
                    {i18n.translate("AppData.WatermarkCard.textInput")}
                  </span>
                </Text>
                <TextField
                  placeholder="Your Company"
                  value={appSettings?.textInput}
                  onChange={(val) => {
                    // setLocalText(val);
                    setAppSettings({
                      ...appSettings,
                      isSaved: false,
                      textInput: val,
                    });
                  }}
                  onBlur={(e) => handleTextUpdate(e.target.value)
                  }
                  autoComplete="off"
                />
              </BlockStack>
            </Box>
            <Divider />
          </>
        )}
        {/* Grid Mode */}
        <Box paddingBlock="400" paddingInline="400">
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm" fontWeight="medium">
              <span style={{ color: '#d773aa' }}>                
                {i18n.translate("AppData.WatermarkCard.gridMode")}
              </span>
            </Text>
            <Checkbox
              checked={appSettings?.gridEnabled || false}
              onChange={handleGridMode}
              label={i18n.translate("AppData.WatermarkCard.gridEnabled")}
            />
            {appSettings?.gridEnabled && (
              <Checkbox
                checked={appSettings?.gridRotated || false}
                onChange={handleGridRotated}
                label={i18n.translate("AppData.WatermarkCard.gridRotated")}
              />
            )}
          </BlockStack>
        </Box>
        <Divider />
        {/* Font Size */}
        {appSettings?.markType === "text" && (
          <>
            <Box paddingBlock="400" paddingInline="400">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" fontWeight="medium">
                  <span style={{ color: '#d773aa' }}>                    
                    {i18n.translate("AppData.WatermarkCard.fontSize")}
                  </span>
                </Text>
                <Popover
                  active={showFont}
                  activator={
                    <Button
                      fullWidth
                      textAlign="left"
                      disclosure="select"
                      onClick={() => setShowFont(!showFont)}
                    >
                      {
                        fontSize.find(
                          (option) =>
                            option.value === (appSettings?.fontSize || "small")
                        )?.label
                      }
                    </Button>
                  }
                  fullWidth
                  sectioned
                  onClose={() => setShowFont(!showFont)}
                >
                  <Listbox
                    onSelect={(val) => {
                      setAppSettings({ ...appSettings, fontSize: val, isSaved: false });
                      setShowFont(false);
                    }}
                    autoSelection={AutoSelection.None}
                  >
                    {fontSize.map((option, index) => (
                      <Listbox.Option
                        key={index}
                        value={option.value}
                        selected={
                          option.value === (appSettings?.fontSize || "small")
                        }
                      >
                        {option?.label}
                      </Listbox.Option>
                    ))}
                  </Listbox>
                </Popover>
              </BlockStack>
            </Box>
            <Divider />
          </>
        )}
        {/* Placement */}
        {!appSettings?.gridEnabled && (
          <>
            <Box paddingBlock="400" paddingInline="400">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" fontWeight="medium">
                  {i18n.translate("AppData.WatermarkCard.placement")}
                </Text>
                <Popover
                  active={showPlacement}
                  activator={
                    <Button
                      fullWidth
                      textAlign="left"
                      disclosure="select"
                      onClick={() => setShowPlacement(!showPlacement)}
                    >
                      {
                        optionsPlacement.find(
                          (option) => option.value === appSettings?.position
                        )?.label
                      }
                    </Button>
                  }
                  autofocusTarget="container"
                  fullWidth
                  sectioned
                  onClose={() => setShowFont(!showPlacement)}
                >
                  <Listbox
                    onSelect={(val) => {
                      setAppSettings({ ...appSettings, position: val, isSaved: false });
                      setShowPlacement(false);
                    }}
                    autoSelection={AutoSelection.None}
                  >
                    {optionsPlacement.map((option, index) => (
                      <Listbox.Option
                        key={index}
                        value={option.value}
                        selected={option.value === appSettings?.position}
                      >
                        {option?.label}
                      </Listbox.Option>
                    ))}
                  </Listbox>
                </Popover>
              </BlockStack>
            </Box>
            <Divider />
          </>
        )}
      </Box>
    </>
  );
}

export default PreviewForm;
