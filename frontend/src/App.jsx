// PATH: src/App.js

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminLogin from "./Pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserDashboard from "./Pages/Users/UserDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public Routes - Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ✅ Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer", "user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Redirect to login for any other route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;