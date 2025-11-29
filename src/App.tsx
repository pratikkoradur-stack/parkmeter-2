import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AccessTypePage } from './pages/AccessTypePage';
import { AuthPage } from './pages/AuthPage';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { UserDashboard } from './pages/user/UserDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { ParkingLayoutPage } from './pages/ParkingLayoutPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/access-type" element={<AccessTypePage />} />
              <Route path="/auth/:userType" element={<AuthPage />} />

              {/* Protected Staff Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute requiredRole="staff">
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected User Routes */}
              <Route
                path="/user/dashboard"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Settings Route */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Parking Layout Route */}
              <Route
                path="/parking-layout"
                element={
                  <ProtectedRoute>
                    <ParkingLayoutPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;