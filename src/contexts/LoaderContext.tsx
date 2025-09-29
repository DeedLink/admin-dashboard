import React, { createContext, useContext, useState, type ReactNode } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface LoaderContextProps {
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextProps>({
  showLoader: () => {},
  hideLoader: () => {},
});

export const useLoader = () => useContext(LoaderContext);

interface LoaderProviderProps {
  children: ReactNode;
}

export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-spin text-6xl text-green-400">
            <AiOutlineLoading3Quarters />
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
};
