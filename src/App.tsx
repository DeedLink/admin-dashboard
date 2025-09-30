import { LoaderProvider } from "./contexts/LoaderContext";
import AdminDashboard from "./main/RegistrarDashboard";

export default function App() {
  return (
    <LoaderProvider>
      <AdminDashboard/>
    </LoaderProvider>
  );
}
