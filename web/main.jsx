import "@shopify/polaris/build/esm/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import TranslationProvider from "./AppRoot";
import { onCLS, onLCP } from "web-vitals";
import './App.css';

const root = document.getElementById("root");
if (!root) throw new Error("#root element not found for booting react app");

onLCP(console.log);
onCLS(console.log);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <TranslationProvider />
  </React.StrictMode>
);
