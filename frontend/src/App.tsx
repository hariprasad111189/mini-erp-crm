import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { useAuth } from "./hooks/useAuth";
import { ChallansPage } from "./pages/ChallansPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductsPage } from "./pages/ProductsPage";

const Protected = ({ children }: { children: JSX.Element }) => {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route
        path="/customers"
        element={
          <Protected>
            <CustomersPage />
          </Protected>
        }
      />
      <Route
        path="/products"
        element={
          <Protected>
            <ProductsPage />
          </Protected>
        }
      />
      <Route
        path="/challans"
        element={
          <Protected>
            <ChallansPage />
          </Protected>
        }
      />
    </Routes>
  );
}

