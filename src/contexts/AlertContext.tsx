import { createContext, useContext, useState, type ReactNode } from "react";
import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

interface Alert {
  id: number;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

let alertIdCounter = 0;

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = (message: string, type: AlertType = "info") => {
    const id = ++alertIdCounter;
    setAlerts((prev) => [...prev, { id, message, type }]);
  };

  const closeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alerts.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative bg-white rounded-xl shadow-2xl border-2 max-w-md w-full p-6 ${getAlertStyles(alert.type)}`}
            >
              <button
                onClick={() => closeAlert(alert.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-4 pr-8">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => closeAlert(alert.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    alert.type === "success"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : alert.type === "error"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : alert.type === "warning"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
};

