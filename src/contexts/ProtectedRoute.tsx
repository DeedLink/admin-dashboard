import { Navigate } from "react-router-dom";
import { useLogin } from "../contexts/LoginContext";
import { type JSX } from "react";

type ProtectedRouteProps = {
  children: JSX.Element;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useLogin();

  if (user?.kycStatus!="verified") {
    return <Navigate to="/" replace />;
  }

  return children;
}
