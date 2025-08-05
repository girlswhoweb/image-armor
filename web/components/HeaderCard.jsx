import {
  Button,
  Icon,
  LegacyStack,
  Text,
  Card,
  Spinner,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  SkeletonBodyText,
} from "@shopify/polaris";
import { ResetMinor, WandMinor } from "@shopify/polaris-icons";
import { useState } from "react";
import { api } from "../api";
import { useI18n } from "@shopify/react-i18n";
import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";

export default function HeaderCard({
  shopSettingsId,
  setIsDifferent,
  setIsActive,
  setToastData,
  appSettings,
  // processStatus,
  setProcessStatus,
  // loading,
  isPaidUser
}) {
  const [i18n] = useI18n({ id: "AppData" });
  const [activating, setActivating] = useState(false);
  // const [stopping, setStopping] = useState(false);
  const shopify = useAppBridge();

  const onActivate = async ({skipCharge = false}) => {
    setToastData({
      isActive: true,
      message: `${i18n.translate("AppData.General.Updating")}...`,
      error: false,
    });
    if (skipCharge === false && isPaidUser !== true) {
      shopify.modal.show("accept-charge-model");
      return;
    }
    setActivating(true);
    try {
      await api.shopSettings.update(shopSettingsId, {
        isActive: true,
        activeData: appSettings,
        isDifferent: false,
      });
      setIsActive(true);
      setIsDifferent(false);
      setToastData({
        isActive: true,
        message: i18n.translate("AppData.General.Updated"),
        error: false,
      });
      setProcessStatus({
        state: "PROCESSING",
      });
    } catch (e) {
      console.log("e", e);
      setToastData({
        isActive: true,
        message: "Something went wrong. Please try again or contact support.",
        error: true,
      });
      setProcessStatus({
        state: "FAILED",
      });
    }
    setActivating(false);
  };

  const acceptAppCharge = async () => {
    setToastData({
      isActive: true,
      message: `Accepting app charge...`,
      error: false,
    });
    const appChargeUrl = "/confirm-charge";
    const response = await api
      .fetch(appChargeUrl, {
        method: "GET",
        headers: { Accept: "*/*" },
      })
      .then((res) => res.json())
      .catch((err) => console.log("err", err));

    if (response?.appSubscriptionCreate?.confirmationUrl) {
      window.top.location.href = response.appSubscriptionCreate.confirmationUrl;
    }
  };

  return (
    <Modal id="accept-charge-model">
      <Box padding="400">
        <p>{i18n.translate("AppData.ChargeCard.p1")}</p>
        <ul>
          <li>{i18n.translate("AppData.ChargeCard.ul1")}</li>
          <li>{i18n.translate("AppData.ChargeCard.ul2")}</li>
          <li>{i18n.translate("AppData.ChargeCard.ul3")}</li>
        </ul>
        <p>{i18n.translate("AppData.ChargeCard.p2")}</p>
      </Box>
      <TitleBar title={i18n.translate("AppData.ChargeCard.title")}>
        <button variant="primary" onClick={acceptAppCharge}>
          {i18n.translate("AppData.ChargeCard.acceptCharges")}
        </button>
        <button
          onClick={() => [
            onActivate({skipCharge: true}),
            shopify.modal.hide("accept-charge-model"),
          ]}
        >
          {i18n.translate("AppData.ChargeCard.skipCharges")}
        </button>
      </TitleBar>
    </Modal>
    // <div className="header-card">
    //   <Card>
    //     <InlineStack align="space-between" blockAlign="center">
    //       <BlockStack>
    //         <Text variant="headingMd" fontWeight="bold">
    //           {i18n.translate("AppData.HeaderCard.welcome")} 👋
    //         </Text>
    //       </BlockStack>
    //       <InlineStack align="end" blockAlign="center">
    //         {loading && (
    //           <Spinner size="small" />
    //         )}
    //         {!loading &&
    //           ["IDEL", "CHARGE", "LIMITED", "FAILED", "COMPLETED"].includes(
    //             processStatus?.state?.toUpperCase()
    //           ) && (
    //             <InlineStack gap={200}>
    //               {processStatus?.state?.toUpperCase() === "LIMITED" && (
    //                 <Button tone="success">
    //                   {i18n.translate("AppData.HeaderCard.limitedMsg")}
    //                 </Button>
    //               )}
    //               {processStatus?.state?.toUpperCase() === "FAILED" && (
    //                 <Badge tone="critical">
    //                   {i18n.translate("AppData.HeaderCard.failedMsg")}
    //                 </Badge>
    //               )}
    //               {processStatus?.state?.toUpperCase() === "COMPLETED" && (
    //                 <Badge tone="success">
    //                   {i18n.translate("AppData.HeaderCard.completedMsg")}
    //                   {processStatus.updatedAt &&
    //                     `${i18n.translate(
    //                       "AppData.HeaderCard.lastUpdated"
    //                     )} ${new Date(
    //                       processStatus.updatedAt
    //                     ).toLocaleString()}`}
    //                 </Badge>
    //               )}
    //               {activating &&
    //               processStatus?.state?.toUpperCase() !== "PROCESSING" ? (
    //                 <Button
    //                   variant="primary"
    //                   icon={<Spinner size="small" />}
    //                   size="large"
    //                   disabled
    //                 >
    //                   {i18n.translate("AppData.HeaderCard.activating")}...
    //                 </Button>
    //               ) : (
    //                 <Button
    //                   variant="primary"
    //                   icon={<Icon source={WandMinor} color="base" />}
    //                   size="large"
    //                   onClick={onActivate}
    //                   disabled={activating}
    //                 >
    //                   {i18n.translate("AppData.HeaderCard.apply")}
    //                 </Button>
    //               )}
    //               {activating &&
    //               processStatus?.state?.toUpperCase() === "REMOVING" ? (
    //                 <Button
    //                   variant="primary"
    //                   icon={<Spinner size="small" />}
    //                   size="large"
    //                   disabled
    //                 >
    //                   {i18n.translate("AppData.HeaderCard.activating")}...
    //                 </Button>
    //               ) : (
    //                 <Button
    //                   // variant="primary"
    //                   tone="critical"
    //                   icon={<Icon source={ResetMinor} color="base" />}
    //                   size="large"
    //                   onClick={onStop}
    //                   disabled={activating}
    //                 >
    //                   {i18n.translate("AppData.HeaderCard.restore")}
    //                 </Button>
    //               )}
    //             </InlineStack>
    //           )}
    //         {!loading &&
    //           ["PROCESSING", "UPLOADING"].includes(
    //             processStatus?.state?.toUpperCase()
    //           ) && (
    //             <InlineStack gap={200}>
    //               <Badge tone="info">
    //                 {i18n.translate("AppData.HeaderCard.processingMsg")}
    //               </Badge>
    //               <Button
    //                 variant="primary"
    //                 icon={<Spinner size="small" />}
    //                 size="large"
    //                 disabled
    //               >
    //                 {i18n.translate("AppData.HeaderCard.processing")}...
    //               </Button>
    //             </InlineStack>
    //           )}
    //         {!loading && processStatus?.state?.toUpperCase() === "REMOVING" && (
    //           <InlineStack>
    //             <Button
    //               variant="primary"
    //               icon={<Spinner size="small" />}
    //               size="large"
    //               disabled
    //             >
    //               {i18n.translate("AppData.HeaderCard.restoring")}...
    //             </Button>
    //           </InlineStack>
    //         )}
    //       </InlineStack>
    //     </InlineStack>
    //   </Card>
    // </div>
  );
}
