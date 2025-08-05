import React, { lazy, Suspense, useMemo } from 'react';
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
  }, [location.pathname]);

  return <div>404 not found</div>;
}

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={
          <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><Spinner /></div>}>
            <WelcomePage />
          </Suspense>
        } />
        <Route path="/watermark" element={
          <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><Spinner /></div>}>
            <ShopPage />
          </Suspense>
        } />
        <Route path="*" element={<Error404 />} />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

function Layout() {
  // const appBridgeRouter = useMemo(
  //   () => ({
  //     location,
  //     history,
  //   }),
  //   [location, history]
  // );
  
  return (
    <GadgetProvider
      type={AppType.Embedded}
      shopifyApiKey={window.gadgetConfig.apiKeys.shopify}
      api={api}
      // router={appBridgeRouter}
    >
      <AuthenticatedApp />
    </GadgetProvider>
  );
}


function AuthenticatedApp() {
  // we use `isAuthenticated` to render pages once the OAuth flow is complete!
  const { isAuthenticated, loading } = useGadget();
  return !isAuthenticated && !loading ? <UnauthenticatedApp /> : <EmbeddedApp />;
  // return isAuthenticated ? <EmbeddedApp /> : <UnauthenticatedApp />;
}

function EmbeddedApp() {
  if (MAINTENANCE_MODE) {
    return (
      <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><Spinner /></div>}>
        <Maintenance />
      </Suspense>
    );
  }
  
  return (
    <>
      <Outlet />
    </>
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