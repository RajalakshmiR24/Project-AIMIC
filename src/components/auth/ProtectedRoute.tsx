// src/components/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { roleToPath } from "../../utils/jwt";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[]; // e.g., ['employee'] | ['doctor'] | ['insurance']
};

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  // Show a lightweight loader while auth state is bootstrapping
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → send to login and remember where they tried to go
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong portal → send them to their correct portal root
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={roleToPath(role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
