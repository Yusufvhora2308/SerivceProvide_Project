// PATH: src/components/ProtectedRoute.jsx
//
// Purpose: Wraps PRIVATE pages (Dashboard, Admin Dashboard, etc).
// If the person is NOT logged in, or logged in with the wrong role,
// they get redirected away — they can never reach these pages directly by URL.

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Not logged in -> send to login, remember where they were trying to go
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const userRole = user.role || "customer";

  // Logged in, but wrong role for this page (e.g. customer trying /admin/dashboard)
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Account blocked/inactive -> force logout
  if (user.status && user.status !== "active") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;