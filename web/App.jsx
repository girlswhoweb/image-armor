import React, { lazy, Suspense, useMemo, useEffect } from 'react';
import { AppType, Provider as GadgetProvider, useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { Page, Spinner, Text } from "@shopify/polaris";
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

  // If token is missing, show a friendly message (usually means identify() hasn't run yet)
  if (!shop?.mantleApiToken) {
    return (
      <Page title="Loading">
        <Text variant="bodyMd" as="p">
          Initializing billing… If this screen persists, ensure your Shopify Shop actions call Mantle <code>identify()</code> and save <code>mantleApiToken</code>.
        </Text>
      </Page>
    );
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

function UnauthenticatedApp() {
  return (
    <Page title="App">
      <Text variant="bodyMd" as="p">
        App can only be viewed in the Shopify Admin.
      </Text>
    </Page>
  );
}

export default App;
