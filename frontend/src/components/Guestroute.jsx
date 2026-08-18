// PATH: src/components/GuestRoute.jsx
//
// Purpose: Wraps PUBLIC pages (Login, Register, AdminLogin).
// If the person is already logged in, they should never see these pages again —
// they get redirected straight to their dashboard instead.
//
// This is the "opposite" of ProtectedRoute:
//   ProtectedRoute -> blocks access WITHOUT login
//   GuestRoute     -> blocks access WHEN ALREADY logged in

import React from "react";
import { Navigate } from "react-router-dom";

function GuestRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Not logged in at all -> let them see the login/register page normally
  if (!token || !user) {
    return children;
  }

  // Already logged in -> send them to the right dashboard based on role
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default GuestRoute;