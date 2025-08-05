import { LegacyCard, ExceptionList, Icon, Text, Card } from "@shopify/polaris";
import React from "react";
import {
  CircleTickOutlineMinor,
  StatusActiveMajor,
} from "@shopify/polaris-icons";
// import { useSelector } from "react-redux";

export default function PricingCard({
  planId,
  planName,
  price,
  items,
  onClick,
  cancelPlan,
}) {
  // const { shopData } = useSelector((state) => state);
  return (
    <Card>
      <div style={{ textAlign: "center" }}>
        <Text variant="headingMd">{planName} Plan</Text>
      </div>
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <Text variant="headingXl">${price}</Text>
      </div>
      <div
        className="ocw-pricing-items"
        style={{
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {items && (
          <ExceptionList
            items={items.map((item) => {
              return {
                icon: CircleTickOutlineMinor,
                description: item,
              };
            })}
          />
        )}
      </div>
      {/* {!((!shopData.plan && planId === "0") || shopData?.plan?.planId === planId) &&
        planId === "0" && (
          <div style={{ textAlign: "center" }}>
            <button
              className="Polaris-Button Polaris-Button--destructive"
              onClick={() => cancelPlan()}
            >
              <span className="Polaris-Button__Content">
                CANCEL SUBSCRIPTION
              </span>
            </button>
          </div>
        )} */}
      <div style={{ textAlign: "center" }}>
        {/* <Button>GET STARTED</Button> */}
        <button
          className="Polaris-Button Polaris-Button--primary"
          style={{ background: "#9381FF" }}
          onClick={() => onClick(planId)}
        >
          {/* <span className="Polaris-Button__Icon">
                    <Icon source={ArrowUpMinor} color="base" />
                  </span> */}
          <span className="Polaris-Button__Content">GET STARTED</span>
        </button>
      </div>
      {/* {((!shopData.plan?.planId && planId === "0") ||
        shopData.plan?.planId === planId) && (
        <div style={{ textAlign: "center" }}>
          <button
            className="Polaris-Button Polaris-Button--disabled"
          >
            <span className="Polaris-Button__Icon">
              <Icon source={StatusActiveMajor} color="base" />
            </span>
            <span className="Polaris-Button__Content">ACTIVE</span>
          </button>
        </div>
      )} */}
    </Card>
  );
}
