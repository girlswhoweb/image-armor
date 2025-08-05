import React from "react";
import { InlineStack, Layout, LegacyStack, Modal, Spinner } from "@shopify/polaris";
import PricingCard from "./PricingCard";

// const PricingCard = lazy(() => import("./PricingCard"));

// import _axios from "../hooks/axios";
// import { setPlanData } from "../redux/planData";
// import { setShopPlan } from "../redux/shopData";
// import { setToastData } from "../redux/toastData";
// import { useDispatch, useSelector } from "react-redux";
// import { setPricingTable } from "../redux/pricingTable";

const PLANS = [
  {
    planId: "basic",
    planName: "Basic",
    planPrice: "9.99",
    planDetails: [
      "Watermark 1000 images per month",
      "SEO 1000 images per month",
      "Watermark 1000 images per month",
      "SEO 1000 images per month",
    ],
  },
  {
    planId: "premium",
    planName: "Premium",
    planPrice: "19.99",
    planDetails: [
      "Watermark 1000 images per month",
      "SEO 1000 images per month",
      "Watermark 1000 images per month",
      "SEO 1000 images per month",
    ],
  },
  // {
  //   planId: "pro",
  //   planName: "Pro",
  //   planPrice: "29.99",
  //   planDetails: [
  //     "Watermark 1000 images per month",
  //     "SEO 1000 images per month",
  //     "Watermark 1000 images per month",
  //     "SEO 1000 images per month",
  //   ],
  // },
]

function Pricing({open}) {
  // const pathName = window.location.pathname;
  // let app;
  // let redirect;
  // if(pathName.includes("internal")){
  //   const navigate = () => {}
  // } else {
  //   app = useAppBridge();
  //   redirect = Redirect.create(app);
  // }
  // const dispatch = useDispatch();

  // const { planData } = useSelector((state) => state);
  // const { active } = useSelector((state) => state.pricingTable);

  const handlePlanSelect = async (planId) => {
    // try {
    //   const sessionToken = await getSessionToken(app);
    //   dispatch(
    //     setToastData({
    //       isActive: true,
    //       message: "Upgrading your plan...",
    //       error: false,
    //     })
    //   );
    //   const res = await _axios(sessionToken).post("/plan/upgrade", {
    //     planId: planId,
    //   });
    //   if (res.status === 200) {
    //     const confirmationUrl = res.data.confirmationUrl;
    //     if (confirmationUrl) {
    //       redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
    //     }
    //   } else {
    //     dispatch(
    //       setToastData({
    //         isActive: true,
    //         message: "Server Error!",
    //         error: true,
    //       })
    //     );
    //   }
    // } catch (error) {
    //   dispatch(
    //     setToastData({
    //       isActive: true,
    //       message: "Server Error!",
    //       error: true,
    //     })
    //   );
    // }
  };
  const cancelPlan = async () => {
    // try {
    //   const sessionToken = await getSessionToken(app);
    //   dispatch(
    //     setToastData({
    //       isActive: true,
    //       message: "Canceling your plan...",
    //       error: false,
    //     })
    //   );
    //   const res = await _axios(sessionToken).post("/plan/cancel");
    //   if (res.status === 200) {
    //     const shopPlan = res.data.shopPlan;
    //     if (shopPlan) {
    //       dispatch(setShopPlan(shopPlan));
    //       dispatch(
    //         setToastData({
    //           isActive: true,
    //           message: "Plan Updated!",
    //           error: false,
    //         })
    //       );
    //     }
    //   } else {
    //     dispatch(
    //       setToastData({
    //         isActive: true,
    //         message: "Server Error!",
    //         error: true,
    //       })
    //     );
    //   }
    // } catch (error) {
    //   dispatch(
    //     setToastData({
    //       isActive: true,
    //       message: "Server Error!",
    //       error: true,
    //     })
    //   );
    // }
  };

  const getPlanData = async () => {
    // let sessionToken;
    // if(pathName.includes("internal")){
    //   sessionToken = ""
    // } else {
    //   sessionToken = await getSessionToken(app);
    // }
    // const res = await _axios(sessionToken).get("/plan");

    // if (res.status === 200) {
    //   // console.log("res.data", res.data);
    //   dispatch(setPlanData({ isLoaded: true, planOptions: res.data }));
    // }
  };

  // useEffect(() => {
  //   mixpanel.track("Pricing Table");
  //   if (!planData?.isLoaded) {
  //     getPlanData();
  //   }
  // }, []);

  return (
    <Modal
      // size="large"
      open={open}
      onClose={() => dispatch(setPricingTable(false))}
      title="Upgrade DinoMark: Bulk Watermark & SEO!"
    >
      <Modal.Section>
        {/* <Layout> */}
        <div style={{
          display: "grid",
          gridTemplate: "1fr / 1fr 1fr",
          gap: "1em",
        }}>
          {/* <InlineStack gap="200" wrap={false}> */}
            {PLANS.map((planOption, index) => 
              // <Layout.Section variant="oneHalf">
                <PricingCard
                  key={index}
                  planId={planOption.planId}
                  planName={planOption.planName}
                  price={planOption.planPrice}
                  items={planOption?.planDetails}
                  hideButton
                  cancelPlan={cancelPlan}
                  onClick={handlePlanSelect}
                />
              // </Layout.Section>
            )}
          {/* </InlineStack> */}
        </div>
        {/* </Layout> */}
      </Modal.Section>
    </Modal>
  );
}

export default Pricing;
