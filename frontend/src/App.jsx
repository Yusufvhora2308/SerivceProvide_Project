// PATH: src/App.js

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminLogin from "./Pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
// import UserDashboard from "./Pages/Users/UserDashboard";
import Services from "./Pages/Customer/Servises";
import ServiceRequest from "./Pages/Customer/ServiceRequest";
import MyRequests from "./Pages/Customer/MyRequests";
import RequestDetails from "./Pages/Customer/RequestDetails";
import CustomerLayout from "./components/Customer/CustomerLayout";
import CustomerDashboard from "./Pages/Customer/CustomerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public Routes - Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ✅ Protected User, Customer Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["customer", "user"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          //customer dashboard
          <Route path="/dashboard" element={<CustomerDashboard />} />
         
          //all services
          <Route path="/customer/services" 
          element={<Services />} 
          />

          //service request
          <Route
            path="/customer/services/:serviceId/request"
            element={<ServiceRequest />}
          />

          //all service request
          <Route path="/customer/requests" element={<MyRequests />} />

          //request details
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
