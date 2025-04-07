
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SiteProvider } from './context/SiteContext'
import { SidebarProvider } from './components/ui/sidebar'
import { migrateDataToSupabase } from './lib/migrate-to-supabase'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tests from './pages/Tests'
import Employees from './pages/Employees'
import Draws from './pages/Draws'
import Reports from './pages/Reports'
import { AppLayout } from './components/layout/AppLayout'
import './App.css'

// Move PrivateRoute inside the AuthProvider context
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

// Create a separate component that uses hooks after the AuthProvider is in place
const AppContent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      migrateDataToSupabase();
    }
  }, [isAuthenticated]);

  // Create PrivateRoute component here, after AuthProvider is available
  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return <div>Carregando...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <AppLayout>{children}</AppLayout>;
  };

  return (
    <SiteProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <PrivateRoute>
                <Tests />
              </PrivateRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <PrivateRoute>
                <Employees />
              </PrivateRoute>
            }
          />
          <Route
            path="/draws"
            element={
              <PrivateRoute>
                <Draws />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/tests" />} />
        </Routes>
      </SidebarProvider>
    </SiteProvider>
  );
};

export default App;
