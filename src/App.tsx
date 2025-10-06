import { LoaderProvider } from "./contexts/LoaderContext";
import { LoginProvider } from "./contexts/LoginContext";
import AdminDashboard from "./main/RegistrarDashboard";

export default function App() {
  return (
    <LoginProvider>
      <LoaderProvider>
        <AdminDashboard/>
      </LoaderProvider>
    </LoginProvider>
  );
}
