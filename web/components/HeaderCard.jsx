import { Box, Button, InlineStack } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useI18n } from "@shopify/react-i18n";
import { Modal } from "@shopify/app-bridge-react";
import { useNavigate } from "react-router-dom";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function HeaderCard({ shopSettingsId }) {
  const [i18n] = useI18n({ id: "AppData" });
  const [starterTrialUsed, setStarterTrialUsed] = useState(false); // legacy flag; can remove later
  const navigate = useNavigate();
  const app = useAppBridge();

  useEffect(() => {
    const fetchShopSettings = async () => {
      const settings = await api.shopSettings.maybeFindOne(shopSettingsId, {
        select: { id: true, starterPlanUser: true },
      });
      setStarterTrialUsed(!!settings?.starterPlanUser);
    };
    fetchShopSettings();
  }, [shopSettingsId]);

  const goToPlans = () => {
    // close the modal if you opened it via appBridge
    try { app?.modal?.hide?.("accept-charge-model"); } catch {}
    navigate("/plans");
  };

  return (
    <Modal id="accept-charge-model">
      <Box padding="400">
        <p>{i18n.translate("AppData.ChargeCard.p1")}</p>
        <ul>
          <li>$14/month Pro — unlimited images - 7-day free trial (up to 50 images)</li>
        </ul>
        <p>{i18n.translate("AppData.ChargeCard.p2")}</p>

        <InlineStack gap="300" align="end">
          <Button onClick={() => goToPlans()} variant="primary">
            Try it
          </Button>
          <Button onClick={() => app?.modal?.hide?.("accept-charge-model")}>
            Not now
          </Button>
        </InlineStack>
      </Box>
    </Modal>
  );
}
