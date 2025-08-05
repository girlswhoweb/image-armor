import { Card, Text, BlockStack, InlineStack, Box, Grid, SkeletonDisplayText, Button } from "@shopify/polaris";
import { api } from "../api";
import { useFindFirst } from "@gadgetinc/react";
import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { useEffect, useState } from "react";
import { useI18n } from "@shopify/react-i18n";
import { Modal, TitleBar } from "@shopify/app-bridge-react";

export default function StatsCard() {
  const [i18n] = useI18n({ id: "AppData" });
  const { appBridge } = useGadget();
  const [{ data, fetching, error }] = useFindFirst(api.shopifyShop);
  const [isPaidUser, setIsPaidUser] = useState(null);

  const getUserData = async () => {
    const userData = await api.shopifyAppSubscription.maybeFindFirst({
      filter:{
        status:{
          equals: "ACTIVE"
        }
      }
    });
    console.log("userData", userData);
    if(userData && userData.status === "ACTIVE"){
      setIsPaidUser(true);
    } else {
      setIsPaidUser(false);
    }
  }
  
  useEffect(() => {
    getUserData();
  }, [])

  const acceptAppCharge = async () => {
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
    <Card padding="0">
      <Grid gap={{xs: "0", sm: "0", md: "0", lg: "0", xl: "0"}}>
        <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
          <Box padding="400" borderInlineEndWidth="0165" borderColor="border">
            <BlockStack gap="200">
              <Text variant="headingMd">Total Marked Images</Text>
              <Text variant="headingXl">
                {fetching ? <SkeletonDisplayText /> : data.markedImagesCount}
              </Text>
            </BlockStack>
          </Box>
        </Grid.Cell>
        <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
          <Box padding="400" borderInlineEndWidth="0165" borderColor="border">
            <BlockStack gap="200">
              <Text variant="headingMd">App Plan</Text>
              <InlineStack gap="200">
                <Text variant="headingXl">
                  {isPaidUser === null ? <SkeletonDisplayText /> : isPaidUser ? "Paid" : "Free"}
                </Text>
                {isPaidUser === false && <Button onClick={() => { appBridge.modal.show("accept-charge-model") }}>Upgrade</Button>
                }
              </InlineStack>
            </BlockStack>
          </Box>
        </Grid.Cell>
      </Grid>
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
              appBridge.modal.hide("accept-charge-model"),
            ]}
          >
            {i18n.translate("AppData.ChargeCard.skipCharges")}
          </button>
        </TitleBar>
      </Modal>
    </Card>
  );
}