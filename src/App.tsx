import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  ProtectedRoute,
  RoleProtectedRoute,
} from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RegisterPage from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Onboarding from "./pages/Onboarding";
import Offboarding from "./pages/Offboarding";
import EVCompliance from "./pages/EVCompliance";
import Penalties from "./pages/Penalties";
import History from "./pages/History";
import WalletPage from "./pages/Wallet";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import Admin from "./pages/Admin";
import AdminApplications from "./pages/AdminApplications";
import AdminEVMonitor from "./pages/AdminEVMonitor";
import AdminPenalties from "./pages/AdminPenalties";
import AdminAggregators from "./pages/AdminAggregators";
import NotFound from "./pages/NotFound";
import Applications from "./pages/Applications";
import Reports from "./pages/Reports";
import AdminContent from "./pages/AdminContent";
import SafetyMonitoring from "./pages/SafetyMonitoring";
import ProcessFlow from "./pages/ProcessFlow";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
});
const operatorRoles = ["aggregator", "dsp"];
const authorityRoles = ["officer", "appellate_officer", "enforcement", "admin"];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <Dashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/fleet"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <Fleet />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <Onboarding />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/offboarding"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <Offboarding />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/ev-compliance"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <EVCompliance />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/penalties"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <Penalties />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <History />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <WalletPage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <Applications />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <RoleProtectedRoute allowedRoles={operatorRoles}>
                  <Reports />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/safety"
              element={
                <RoleProtectedRoute allowedRoles={[...operatorRoles, "officer", "enforcement", "admin"]}>
                  <SafetyMonitoring />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/process-flow"
              element={<ProtectedRoute><ProcessFlow /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRoles={authorityRoles}>
                  <Admin />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <RoleProtectedRoute
                  allowedRoles={["officer", "appellate_officer", "admin"]}
                >
                  <AdminApplications />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/compliance"
              element={
                <RoleProtectedRoute
                  allowedRoles={["officer", "enforcement", "admin"]}
                >
                  <AdminEVMonitor />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/enforcement"
              element={
                <RoleProtectedRoute
                  allowedRoles={["enforcement", "appellate_officer", "admin"]}
                >
                  <AdminPenalties />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/mis"
              element={
                <RoleProtectedRoute
                  allowedRoles={["officer", "enforcement", "admin"]}
                >
                  <AdminAggregators />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <AdminContent />
                </RoleProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
