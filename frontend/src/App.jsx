import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/crm/ProtectedRoute";

// Layouts
import Header from "./components/Header";
import Footer from "./components/Footer";
import CrmLayout from "./components/crm/CrmLayout";

// Website Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";

// Auth Pages
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// CRM Pages
import Dashboard from "./pages/crm/Dashboard";
import ManageUsers from "./pages/superadmin/ManageUsers"
import RoleManagement from "./pages/superadmin/RoleManagement";
import ActivityLogs from "./pages/superadmin/ActivityLogs";
import PlansManagement from "./pages/superadmin/PlansManagement";
import ClientSubscriptions from "./pages/superadmin/ClientSubscriptions";
import EmailManagement from "./pages/superadmin/EmailManagement";
import BroadcastEmail from "./pages/superadmin/BroadcastEmail";
import Notifications from "./pages/superadmin/Notifications";
import InvoicesManagement from "./pages/superadmin/InvoicesManagement";
import PaymentStatus from "./pages/superadmin/PaymentStatus";
import MenuConfiguration from "./pages/superadmin/MenuConfiguration";
import PlanFeatureToggle from "./pages/superadmin/PlanFeatureToggle";
import SystemConfiguration from "./pages/superadmin/SystemConfiguration";
import ApiWebhooks from "./pages/superadmin/ApiWebhooks";
import LoginAttempts from "./pages/superadmin/LoginAttempts";
import ApiUsage from "./pages/superadmin/ApiUsage";

// This component wraps all public-facing website pages
const WebsiteLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected CRM Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<CrmLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Superadmin Route */}
            <Route path="/superadmin/manage-admins" element={<ManageUsers />} />
            <Route path="/superadmin/roles" element={<RoleManagement />} />
            <Route path="/superadmin/activity-logs" element={<ActivityLogs />} />
            <Route path="/superadmin/plans" element={<PlansManagement />} />
            <Route path="/superadmin/subscriptions" element={<ClientSubscriptions />} />
            <Route path="/superadmin/email" element={<EmailManagement />} />
            <Route path="/superadmin/broadcasts" element={<BroadcastEmail />} />
            <Route path="/superadmin/notifications" element={<Notifications />} />
            <Route path="/superadmin/invoices" element={<InvoicesManagement />} />
            <Route path="/superadmin/payments" element={<PaymentStatus />} />
            <Route path="/superadmin/menu-config" element={<MenuConfiguration />} />
            <Route path="/superadmin/feature-toggle" element={<PlanFeatureToggle />} />
            <Route path="/superadmin/gateways" element={<SystemConfiguration />} />
            <Route path="/superadmin/storage" element={<SystemConfiguration />} />
            <Route path="/superadmin/system-configure" element={<SystemConfiguration />} />
            <Route path="/superadmin/api-webhooks" element={<ApiWebhooks />} />
            <Route path="/superadmin/login-logs" element={<LoginAttempts />} />
            <Route path="/superadmin/api-logs" element={<ApiUsage />} />
            
            {/* Add other admin/user routes here in the future */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
