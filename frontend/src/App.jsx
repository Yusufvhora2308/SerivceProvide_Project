// PATH: src/App.js

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminLogin from "./Pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminUsers from "./Pages/Admin/AdminUsers";
import Providers from "./Pages/Admin/Providers";

// import UserDashboard from "./Pages/Users/UserDashboard";
import Services from "./Pages/Customer/Services";
import ServiceRequest from "./Pages/Customer/ServiceRequest";
import MyRequests from "./Pages/Customer/MyRequests";
import RequestDetails from "./Pages/Customer/RequestDetails";
import CustomerLayout from "./components/Customer/CustomerLayout";
import CustomerDashboard from "./Pages/Customer/CustomerDashboard";
import CustomerProfile from "./Pages/Customer/CustomerProfile";



import ProviderRegister from "./Pages/Provider/ProviderRegister";
import { ProviderDashboard } from "./Pages/Provider/ProviderDashboard";
import ProviderLogin from "./Pages/Provider/ProviderLogin";
import ProviderSetup from "./Pages/Provider/ProviderSetup";
import ProviderVerificationPending from "./Pages/Provider/ProviderVerificationPending";
import ProviderDocumentEdit from "./Pages/Provider/ProviderDocumentEdit";

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
          <Route path="/customer/services" element={<Services />}/>

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

       {/* ========================================= */}
{/* PROVIDER ROUTES */}
{/* ========================================= */}

  {/* Provider Register - Wrap with GuestRoute */}
        <Route
          path="/provider/register"
          element={
            <GuestRoute>
              <ProviderRegister />
            </GuestRoute>
          }
        />

        {/* Provider Login - Wrap with GuestRoute */}
        <Route
          path="/provider/login"
          element={
            <GuestRoute>
              <ProviderLogin />
            </GuestRoute>
          }
        />

        {/* Provider Verification - This should be accessible after registration */}
        <Route
          path="/provider/verification"
          element={<ProviderVerificationPending />}
        />

        <Route
          path="/provider/documents/edit"
          element={<ProviderDocumentEdit />}
        />

        {/* Provider Setup - Protected */}
        <Route
          path="/provider/setup"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderSetup />
            </ProtectedRoute>
          }
        />

        {/* Provider Dashboard - Protected */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />


        {/* ✅ Protected Admin Routes */}
         <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/providers" element={<Providers />} />
        </Route>

        {/* ✅ Redirect to login for any other route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;