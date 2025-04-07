
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SiteProvider } from './context/SiteContext'
import { SidebarProvider } from './components/ui/sidebar'
import { migrateDataToSupabase } from './lib/migrate-to-supabase'
import { useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tests from './pages/Tests'
import Employees from './pages/Employees'
import Draws from './pages/Draws'
import Reports from './pages/Reports'
import { AppLayout } from './components/layout/AppLayout'
import './App.css'

// Move PrivateRoute to a separate component that gets the auth context from props
const PrivateRoute = ({ children, isAuthenticated, isLoading }: { 
  children: React.ReactNode, 
  isAuthenticated: boolean, 
  isLoading: boolean 
}) => {
  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <AppLayout>{children}</AppLayout>
}

// Create an AppRoutes component that will use the auth context
const AppRoutes = () => {
  // Import useAuth here, after the AuthProvider is set up
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      migrateDataToSupabase()
    }
  }, [isAuthenticated])

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
          <Route path="*" element={<Navigate to="/tests" />} />
        </Routes>
      </SidebarProvider>
    </SiteProvider>
  )
}

// Import useAuth here for the AppRoutes component
import { useAuth } from './context/AuthContext'

// The main App component now just sets up the providers
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
