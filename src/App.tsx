
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SiteProvider } from './context/SiteContext'
import { SidebarProvider } from './components/ui/sidebar'
import { migrateDataToSupabase } from './lib/migrate-to-supabase'
import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tests from './pages/Tests'
import Employees from './pages/Employees'
import Draws from './pages/Draws'
import Reports from './pages/Reports'
import { AppLayout } from './components/layout/AppLayout'
import './App.css'

// Import useAuth here for the AppRoutes component
import { useAuth } from './context/AuthContext'

// Move PrivateRoute to a separate component that gets the auth context from props
const PrivateRoute = ({ children, isAuthenticated, isLoading }: { 
  children: React.ReactNode, 
  isAuthenticated: boolean, 
  isLoading: boolean 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Carregando...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <AppLayout>{children}</AppLayout>;
};

// Create an AppRoutes component that will use the auth context
const AppRoutes = () => {
  // Use auth context
  const { isAuthenticated, isLoading, user } = useAuth();
  const [hasMigrated, setHasMigrated] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !hasMigrated) {
      migrateDataToSupabase();
      setHasMigrated(true);
    }
  }, [isAuthenticated, hasMigrated]);

  return (
    <SiteProvider>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <Tests />
              </PrivateRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <Employees />
              </PrivateRoute>
            }
          />
          <Route
            path="/draws"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <Draws />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SidebarProvider>
    </SiteProvider>
  );
};

// The main App component now just sets up the providers
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
