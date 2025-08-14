import { Box } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useI18n } from "@shopify/react-i18n";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { useAcceptAppCharge } from "../hooks/useAcceptAppCharge";

export default function HeaderCard({ shopSettingsId }) {
  const [i18n] = useI18n({ id: "AppData" });
  const [starterTrialUsed, setStarterTrialUsed] = useState(false);
  const acceptAppCharge = useAcceptAppCharge();

  useEffect(() => {
    const fetchShopSettings = async () => {
      const settings = await api.shopSettings.maybeFindOne(shopSettingsId, {
        select: { id: true, starterPlanUser: true },
      });
      setStarterTrialUsed(!!settings?.starterPlanUser);
    };
    fetchShopSettings();
  }, [shopSettingsId]);

  return (
    <Modal id="accept-charge-model">
      <Box padding="400">
        <p>{i18n.translate("AppData.ChargeCard.p1")}</p>
        <ul>
          <li>Starter: $1 for 7-day trial (max 50 images)</li>
          <li>{i18n.translate("AppData.ChargeCard.ul2")}</li>
          <li>{i18n.translate("AppData.ChargeCard.ul3")}</li>
        </ul>
        <p>{i18n.translate("AppData.ChargeCard.p2")}</p>
      </Box>
    <TitleBar title={i18n.translate("AppData.ChargeCard.title")}>
      <button
        onClick={() => acceptAppCharge("starter")}
        disabled={starterTrialUsed}
      >
        {starterTrialUsed
        ? i18n.translate("AppData.ChargeCard.trialUsed")
        : i18n.translate("AppData.ChargeCard.trial")}
      </button>
      <button variant="primary" onClick={() => acceptAppCharge("pro")}>
        {i18n.translate("AppData.ChargeCard.proPlan")}
      </button>
    </TitleBar>
    </Modal>
  );
}
