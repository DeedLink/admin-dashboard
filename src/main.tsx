import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalletProvider } from "./contexts/WalletContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LoginProvider } from "./contexts/LoginContext";
import { AlertProvider } from "./contexts/AlertContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AlertProvider>
      <ToastProvider>
        <LoginProvider>
          <WalletProvider>
            <App />
          </WalletProvider>
        </LoginProvider>
      </ToastProvider>
    </AlertProvider>
  </React.StrictMode>
);
