import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProviderProtectedRoute({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!token || !userData) {
    return (
      <Navigate
        to="/provider/login"
        state={{
          from: location.pathname,
        }}
        replace
      />
    );
  }

  // ==========================================
  // PARSE USER
  // ==========================================

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    return (
      <Navigate
        to="/provider/login"
        replace
      />
    );
  }

  // ==========================================
  // PROVIDER ROLE CHECK
  // ==========================================

  if (user?.role !== "provider") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    return (
      <Navigate
        to="/provider/login"
        replace
      />
    );
  }

  // ==========================================
  // ACCOUNT STATUS
  // ==========================================

  if (
    user?.status &&
    user.status !== "active"
  ) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    return (
      <Navigate
        to="/provider/login"
        replace
      />
    );
  }

  return children;
}

export default ProviderProtectedRoute;