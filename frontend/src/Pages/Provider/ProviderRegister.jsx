import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const ProviderRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
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
      const response = await axios.post("/provider/register", formData);

      if (response.data.success) {
        const { token, user, provider } = response.data.data;

        // Save authentication information
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("provider", JSON.stringify(provider));

        // Provider registration complete
        navigate("/provider/setup");
      }
    } catch (error) {
      console.error("Provider registration error:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        const firstError = Object.values(errors)[0]?.[0];

        setError(firstError || "Please check your information.");
      } else {
        setError(
          error.response?.data?.message ||
            "Registration failed. Please try again.",
        );
      }
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

        <div className="hidden bg-blue-600 lg:flex lg:flex-col lg:justify-between p-12 text-white">
          <div>
            <div className="text-3xl font-bold">QuickFix</div>

            <p className="mt-2 text-blue-100">
              Professional Service Marketplace
            </p>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold leading-tight">
              Grow your business with QuickFix.
            </h1>

            <p className="mt-5 text-lg leading-8 text-blue-100">
              Connect with customers, receive service requests, and grow your
              professional service business.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  ✓
                </span>

                <span>Get new customers</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  ✓
                </span>

                <span>Manage service requests</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                  ✓
                </span>

                <span>Track your earnings</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-blue-200">© 2026 QuickFix</p>
        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Logo */}

            <div className="mb-8 lg:hidden">
              <div className="text-3xl font-bold text-blue-600">QuickFix</div>

              <p className="mt-1 text-sm text-gray-500">
                Professional Service Marketplace
              </p>
            </div>

            {/* Heading */}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Become a Provider
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your professional account to get started.
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
              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

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

              {/* Phone */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Confirm Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Create Provider Account"}
              </button>
            </form>

            {/* Login */}

            <div className="mt-7 text-center text-sm text-gray-500">
              Already a provider?
              <Link
                to="/provider/login"
                className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign In
              </Link>
            </div>

            {/* Customer */}

            <div className="mt-5 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
              Looking for services?
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

export default ProviderRegister;
