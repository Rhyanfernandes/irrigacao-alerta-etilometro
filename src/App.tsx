
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Tests from "./pages/Tests";
import Draws from "./pages/Draws";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteProvider } from "./context/SiteContext";
import { initializeSites } from "./lib/init-data";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Initialize app data
const InitializeApp = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Initialize sites data if not already present
    const storedSites = localStorage.getItem("irricom_sites");
    if (!storedSites || JSON.parse(storedSites).length === 0) {
      initializeSites();
    }
  }, []);

  return <>{children}</>;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// App routes with authentication
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <SiteProvider>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </SiteProvider>
          </ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute>
            <SiteProvider>
              <AppLayout>
                <Employees />
              </AppLayout>
            </SiteProvider>
          </ProtectedRoute>
        } />
        <Route path="/tests" element={
          <ProtectedRoute>
            <SiteProvider>
              <AppLayout>
                <Tests />
              </AppLayout>
            </SiteProvider>
          </ProtectedRoute>
        } />
        <Route path="/draws" element={
          <ProtectedRoute>
            <SiteProvider>
              <AppLayout>
                <Draws />
              </AppLayout>
            </SiteProvider>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <SiteProvider>
              <AppLayout>
                <Reports />
              </AppLayout>
            </SiteProvider>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <InitializeApp>
        <TooltipProvider>
          <AppRoutes />
          <Toaster />
        </TooltipProvider>
      </InitializeApp>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
