import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalletProvider } from "./contexts/WalletContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LoginProvider } from "./contexts/LoginContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <LoginProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </LoginProvider>
    </ToastProvider>
  </React.StrictMode>
);
