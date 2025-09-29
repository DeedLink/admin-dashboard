import { createContext, useContext, useState, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: number;
  message: string;
  type: ToastType;
  leaving?: boolean;
  entering?: boolean;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let idCounter = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = ++idCounter;

    setToasts((prev) => [...prev, { id, message, type, entering: true }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, entering: false } : t))
      );
    }, 50);

    setTimeout(() => startLeaving(id), 3500);
  };

  const startLeaving = (id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => removeToast(id), 600);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToastClick = (id: number) => {
    startLeaving(id);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 pointer-events-none font-spectral">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            onClick={() => handleToastClick(toast.id)}
            className={`
              toast px-6 py-3 rounded-xl text-white shadow-2xl 
              transform transition-all duration-500 ease-out
              cursor-pointer pointer-events-auto
              hover:scale-105 hover:shadow-3xl
              backdrop-blur-sm relative overflow-hidden
              ${
                toast.type === "success"
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : toast.type === "error"
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }
              ${
                toast.entering
                  ? "opacity-0 translate-x-full scale-95 rotate-3"
                  : toast.leaving
                  ? "opacity-0 translate-x-full scale-90 -rotate-2"
                  : "opacity-100 translate-x-0 scale-100 rotate-0"
              }
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              transformOrigin: "right center"
            }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex-shrink-0">
                {toast.type === "success" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {toast.type === "error" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {toast.type === "info" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="font-extrabold text-sm leading-relaxed">
                {toast.message}
              </div>
            </div>
            
            <div className="absolute top-[0px] left-0 h-full w-full rounded-xl overflow-hidden">
              <div 
                className="h-full bg-yellow-500 bg-opacity-90 rounded-xl"
                style={{
                  animation: toast.entering ? 'none' : 'toast-progress 3500ms linear forwards'
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes toast-progress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
