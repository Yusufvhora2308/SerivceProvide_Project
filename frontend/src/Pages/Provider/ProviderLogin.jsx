import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const ProviderLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/login", formData);

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Make sure this is actually a provider
        if (user.role !== "provider") {
          setError("This account is not registered as a service provider.");

          setLoading(false);
          return;
        }

        localStorage.setItem("token", token);

        localStorage.setItem("user", JSON.stringify(user));

        navigate("/provider/dashboard");
      }
    } catch (error) {
      console.error("Provider login error:", error);

      setError(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ================================= */}
        {/* LEFT SIDE */}
        {/* ================================= */}

        <div className="hidden bg-blue-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="text-3xl font-bold">QuickFix</div>

            <p className="mt-2 text-blue-100">
              Professional Service Marketplace
            </p>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight">
              Welcome back, Provider.
            </h1>

            <p className="mt-5 text-lg leading-8 text-blue-100">
              Manage your service requests, connect with customers, and grow
              your business.
            </p>
          </div>

          <p className="text-sm text-blue-200">© 2026 QuickFix</p>
        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}

            <div className="mb-10 lg:hidden">
              <div className="text-3xl font-bold text-blue-600">QuickFix</div>

              <p className="mt-1 text-sm text-gray-500">Provider Portal</p>
            </div>

            {/* Heading */}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Provider Sign In
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Sign in to manage your service requests.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Password */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Login */}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Register */}

            <div className="mt-7 text-center text-sm text-gray-500">
              New service provider?
              <Link
                to="/provider/register"
                className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
              >
                Create Account
              </Link>
            </div>

            {/* Customer Login */}

            <div className="mt-5 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
              Looking for a service?
              <Link
                to="/login"
                className="ml-1 font-semibold text-gray-700 hover:text-blue-600"
              >
                Customer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;
