import React, { createContext, useContext, useState, type ReactNode } from "react";
import Loader from "../components/Loader";

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
        <Loader/>
      )}
    </LoaderContext.Provider>
  );
};
