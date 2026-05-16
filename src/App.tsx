import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, RoleProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import EVCompliance from "./pages/EVCompliance";
import WalletPage from "./pages/Wallet";
import Grievances from "./pages/Grievances";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Offboarding from "./pages/Offboarding";
import Penalties from "./pages/Penalties";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import ChangePassword from "./pages/ChangePassword";
import RegisterPage from "./pages/Register";
import AdminApplications from "./pages/AdminApplications";
import AdminFleetVerify from "./pages/AdminFleetVerify";
import AdminEVMonitor from "./pages/AdminEVMonitor";
import AdminPenalties from "./pages/AdminPenalties";
import AdminGrievances from "./pages/AdminGrievances";
import AdminAggregators from "./pages/AdminAggregators";
import AdminAggregatorDetail from "./pages/AdminAggregatorDetail";

const queryClient = new QueryClient();

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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/fleet" element={<ProtectedRoute><Fleet /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/offboarding" element={<ProtectedRoute><Offboarding /></ProtectedRoute>} />
            <Route path="/ev-compliance" element={<ProtectedRoute><EVCompliance /></ProtectedRoute>} />
            <Route path="/penalties" element={<ProtectedRoute><Penalties /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/grievances" element={<ProtectedRoute><Grievances /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/admin" element={<RoleProtectedRoute allowedRoles={["officer", "enforcement", "admin"]}><Admin /></RoleProtectedRoute>} />
            <Route path="/admin/applications" element={<RoleProtectedRoute allowedRoles={["officer", "enforcement", "admin"]}><AdminApplications /></RoleProtectedRoute>} />
            <Route path="/admin/fleet-verify" element={<RoleProtectedRoute allowedRoles={["officer", "enforcement", "admin"]}><AdminFleetVerify /></RoleProtectedRoute>} />
            <Route path="/admin/ev-monitor" element={<RoleProtectedRoute allowedRoles={["officer", "enforcement", "admin"]}><AdminEVMonitor /></RoleProtectedRoute>} />
            <Route path="/admin/penalties" element={<RoleProtectedRoute allowedRoles={["officer", "enforcement", "admin"]}><AdminPenalties /></RoleProtectedRoute>} />
            <Route path="/admin/grievances" element={<RoleProtectedRoute allowedRoles={["officer", "enforcement", "admin"]}><AdminGrievances /></RoleProtectedRoute>} />
            <Route path="/admin/aggregators" element={<RoleProtectedRoute allowedRoles={["officer", "enforcement", "admin"]}><AdminAggregators /></RoleProtectedRoute>} />
            <Route path="/admin/aggregators/:id" element={<RoleProtectedRoute allowedRoles={["officer", "enforcement", "admin"]}><AdminAggregatorDetail /></RoleProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
