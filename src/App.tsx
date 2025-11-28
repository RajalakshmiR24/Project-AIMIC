import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

import LandingPage from "./components/LandingPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import EmployeePortal from "./components/portals/EmployeePortal";
import InsurancePortal from "./components/portals/InsurancePortal";
import DoctorPortal from "./components/portals/DoctorPortal";

import ChatBot from "./components/ChatBot";

import { decodeRoleFromToken, roleToPath } from "./utils/jwt";

// Providers
import { DoctorProvider } from "./contexts/DoctorContext";
import { ClaimsProvider } from "./contexts/ClaimsContext";
import { InsuranceProvider } from "./contexts/InsuranceContext";
import { EmployeeProvider } from "./contexts/EmployeeContext";

/* ---------------------------------------------
   Redirects user to their correct portal
---------------------------------------------- */
const HomeRouter: React.FC = () => {
  const { isAuthenticated, user, token, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    const role = user?.role ?? decodeRoleFromToken(token);
    const path = role ? roleToPath(role) : "/unauthorized";

    navigate(path, { replace: true });
  }, [isAuthenticated, isLoading, user, token, navigate]);

  if (!isAuthenticated) return <LandingPage />;
  return null;
};

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root */}
          <Route path="/" element={<HomeRouter />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* EMPLOYEE PORTAL */}
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeProvider>
                  <ClaimsProvider>
                <EmployeePortal />
                </ClaimsProvider>
                </EmployeeProvider>
              </ProtectedRoute>
            }
          />

          {/* INSURANCE PORTAL */}
          <Route
            path="/insurance/*"
            element={
              <ProtectedRoute allowedRoles={["insurance"]}>
                <InsuranceProvider>
                  <InsurancePortal />
                </InsuranceProvider>
              </ProtectedRoute>
            }
          />

          {/* DOCTOR PORTAL */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorProvider>
                  <ClaimsProvider>
                    <DoctorPortal />
                  </ClaimsProvider>
                </DoctorProvider>
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Unauthorized Access
                  </h1>
                  <p className="text-gray-600 mb-6">
                    You don't have permission to access this portal.
                  </p>
                  <a
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Login
                  </a>
                </div>
              </div>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ChatBot
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
