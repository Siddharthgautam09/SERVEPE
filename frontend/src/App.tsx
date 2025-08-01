

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import RoleSelectionWithDetails from "./pages/RoleSelectionWithDetails";
import UserProfileByUsername from "./pages/UserProfileByUsername";
import EmailOTPLogin from "./pages/EmailOTPLogin";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import UserProfile from "./components/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Import existing pages
import Login from "@/pages/Login";
import OTPLogin from "@/pages/OTPLogin";
import FreelancerDashboard from "@/pages/FreelancerDashboard";
import ClientDashboard from "@/pages/ClientDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminLayout from "@/pages/admin/AdminLayout";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import CreateService from "@/pages/CreateService";
import MyServices from "@/pages/MyServices";
import FreelancerOrderDashboard from "@/pages/FreelancerOrderDashboard";
import PostProject from "@/pages/PostProject";
import FreelancerProjects from "@/pages/FreelancerProjects";
import Messages from "@/pages/Messages";
import ClientOrders from "@/pages/ClientOrders";
import SidebarLayout from './components/SidebarLayout';
import Testimonials from './pages/Testimonials';
import Analytics from './pages/Analytics';
import Payout from './pages/Payout';
import Account from './pages/Account';
import WhatsNew from './pages/WhatsNew';
import FreelancerOrders from './pages/FreelancerOrders';
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/otp-login" element={<OTPLogin />} />
              <Route path="/email-otp-login" element={<EmailOTPLogin />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route 
                  path="dashboard" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Route>

              {/* Role Selection Routes */}
              <Route 
                path="/role-selection" 
                element={
                  <ProtectedRoute requireRoleSelection={false}>
                    <RoleSelectionWithDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute requireRoleSelection={false}>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              
              {/* Onboarding */}
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } 
              />
              
              {/* Profile Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />

              {/* Messaging Route */}
              <Route
                path="/messaging"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <Messages />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

              {/* Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                }
              />

              {/* Freelancer Routes with Sidebar */}
              <Route
                path="/freelancer/dashboard"
                element={
                  <ProtectedRoute requiredRole="freelancer">
                    <SidebarLayout>
                      <FreelancerDashboard />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/freelancer"
                element={
                  <ProtectedRoute requiredRole="freelancer">
                    <SidebarLayout>
                      <FreelancerDashboard />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer/orders"
                element={
                  <ProtectedRoute requiredRole="freelancer">
                    <SidebarLayout>
                      <FreelancerOrders />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-service"
                element={
                  <ProtectedRoute requiredRole="freelancer">
                    <SidebarLayout>
                      <CreateService />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-services"
                element={
                  <ProtectedRoute requiredRole="freelancer">
                    <SidebarLayout>
                      <MyServices />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-project"
                element={
                  <ProtectedRoute requiredRole="freelancer">
                    <SidebarLayout>
                      <PostProject />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/freelancer-projects"
                element={
                  <ProtectedRoute requiredRole="freelancer">
                    <SidebarLayout>
                      <FreelancerProjects />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

              {/* Client Routes with Sidebar */}
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute requiredRole="client">
                    <SidebarLayout>
                      <ClientDashboard />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/client"
                element={
                  <ProtectedRoute requiredRole="client">
                    <SidebarLayout>
                      <ClientDashboard />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/orders"
                element={
                  <ProtectedRoute requiredRole="client">
                    <SidebarLayout>
                      <ClientOrders />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

              {/* Sidebar Menu Routes */}
              <Route
                path="/testimonials"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <Testimonials />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <Analytics />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payout"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <Payout />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <Account />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/whats-new"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <WhatsNew />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Username-based profile route - Must be last before catch-all */}
              <Route path="/:username" element={<UserProfileByUsername />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Dashboard redirect component to handle role-based routing
const DashboardRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.role === 'freelancer') {
      navigate('/freelancer/dashboard', { replace: true });
    } else if (user?.role === 'client') {
      navigate('/client/dashboard', { replace: true });
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return <div>Redirecting...</div>;
};

export default App;