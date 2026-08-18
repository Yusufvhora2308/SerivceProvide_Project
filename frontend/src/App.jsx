// PATH: src/App.js

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminLogin from "./Pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
// import UserDashboard from "./Pages/Users/UserDashboard";
import Services from "./Pages/Customer/Servises";
import ServiceRequest from "./Pages/Customer/ServiceRequest";
import MyRequests from "./Pages/Customer/MyRequests";
import RequestDetails from "./Pages/Customer/RequestDetails";
import CustomerLayout from "./components/Customer/CustomerLayout";
import CustomerDashboard from "./Pages/Customer/CustomerDashboard";
import CustomerProfile from "./Pages/Customer/CustomerProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public Routes - Authentication */}
        {/* GuestRoute: if already logged in, these redirect straight to the
            correct dashboard instead of showing the login/register form again */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/admin/login"
          element={
            <GuestRoute>
              <AdminLogin />
            </GuestRoute>
          }
        />

        {/* ✅ Protected User, Customer Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["customer", "user"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          {/* customer dashboard */}
          <Route path="/dashboard" element={<CustomerDashboard />} />

          <Route path="/customer/profile" element={<CustomerProfile />}/>

          {/* all services */}
          <Route path="/customer/services" element={<Services />} />

          {/* service request */}
          <Route
            path="/customer/services/:serviceId/request"
            element={<ServiceRequest />}
          />

          {/* all service requests */}
          <Route path="/customer/requests" element={<MyRequests />} />

          {/* request details */}
          <Route
            path="/customer/service-requests/:id"
            element={<RequestDetails />}
          />
        </Route>

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