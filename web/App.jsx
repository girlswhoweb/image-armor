import React, { lazy, Suspense, useState, useEffect } from 'react';
import { AppType, Provider as GadgetProvider, useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { Page, Spinner, Text, Button } from "@shopify/polaris";
import { api } from "./api";
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useFindFirst } from "@gadgetinc/react";
import { MantleProvider } from "@heymantle/react";
const PlansPage = lazy(() => import("./pages/PlansPage"));

// for debugging
// const res = await api.fetch("/mantle-identify-now", { method: "POST" });
// const json = await res.json();
// console.log(json);

import './App.css';

// Lazy load components
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const Maintenance = lazy(() => import("./components/Maintenance"));

// Set this to true to enable maintenance mode
const MAINTENANCE_MODE = false;

function Error404() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname ===
      new URL(process.env["GADGET_PUBLIC_SHOPIFY_APP_URL"]).pathname
    )
      return navigate("/", { replace: true });
  }, [location.pathname, navigate]);

  return <div>404 not found</div>;
}

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spinner />
              </div>
            }>
              <WelcomePage />
            </Suspense>
          }
        />
        <Route
          path="/watermark"
          element={
            <Suspense fallback={
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spinner />
              </div>
            }>
              <ShopPage />
            </Suspense>
          }
        />
        <Route
          path="/plans"
          element={
            <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><Spinner /></div>}>
              <PlansPage/>
            </Suspense>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

function Layout() {
  return (
    <GadgetProvider
      type={AppType.Embedded}
      shopifyApiKey={window.gadgetConfig.apiKeys.shopify}
      api={api}
    >
      <AuthenticatedApp />
    </GadgetProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useGadget();
  return !isAuthenticated && !loading ? <UnauthenticatedApp /> : <EmbeddedApp />;
}

function EmbeddedApp() {
  if (MAINTENANCE_MODE) {
    return (
      <Suspense fallback={
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Spinner />
        </div>
      }>
        <Maintenance />
      </Suspense>
    );
  }

  // 🔑 Fetch Mantle customer token from shopifyShop (set during install/update via identify())
  const [{ data: shop, fetching }] = useFindFirst(api.shopifyShop, {
    select: { mantleApiToken: true }
  });

  if (fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spinner />
      </div>
    );
  }

  if (!shop?.mantleApiToken) {
    return <LoadingBilling />;
  }

  return (
    <MantleProvider
      appId={process.env.GADGET_PUBLIC_MANTLE_APP_ID}
      customerApiToken={shop.mantleApiToken}
    >
      <Outlet />
    </MantleProvider>
  );
}

// function UnauthenticatedApp() {
//   return (
//     <Page title="App">
//       <Text variant="bodyMd" as="p">
//         App can only be viewed in the Shopify Admin.
//       </Text>
//     </Page>
//   );
// }

function UnauthenticatedApp() {
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we’re inside Shopify (app bridge exists), push to /plans
    if (shopify && location.pathname !== "/plans") {
      navigate("/plans", { replace: true });
    }
  }, [shopify, location.pathname, navigate]);

  // If you still want to show a message when truly outside Shopify, you can:
  return null; // or keep the Page/Text if you want a fallback for non-admin access
}

function LoadingBilling() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const retry = async () => {
    try {
      setBusy(true);
      setMsg("Contacting billing…");
      // IMPORTANT: use api.fetch (targets your Gadget origin & includes session)
      const res = await api.fetch("/mantle-identify-now", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      console.log("identify-now:", data);
      if (data?.mantleApiToken) {
        setMsg("Token saved. Reloading…");
        location.reload();
      } else {
        setMsg(`Still no token (${data?.reason || "unknown"}). Check env vars.`);
      }
    } catch (e) {
      setMsg(`Error: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title="Loading">
      <Text as="p" variant="bodyMd">
        Initializing billing… If this persists, click “Retry billing setup”.
      </Text>
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <Button onClick={retry} loading={busy} variant="primary">
          Retry billing setup
        </Button>
        {busy ? <Spinner size="small" /> : null}
        {msg ? <Text as="span" tone="subdued">{msg}</Text> : null}
      </div>
    </Page>
  );
}


export default App;
