import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    terms: false,
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Register Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsError(false);

    // Check password match
    if (formData.password !== formData.password_confirmation) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    // Password length check
    if (formData.password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters.");
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setIsError(true);
      setMessage("Phone number must contain exactly 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register", formData);

      console.log("Register Response:", response.data);

      // Save token & user if returned directly
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      setIsError(false);
      setMessage(response.data.message || "Registration successful!");

      // Navigate to login
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      console.error("Registration Error:", error);
      setIsError(true);

      if (error.response) {
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          const firstError = Object.values(errors)[0]?.[0];
          setMessage(firstError || "Validation failed.");
        } else {
          setMessage(error.response.data.message || "Registration failed.");
        }
      } else if (error.request) {
        setMessage("Unable to connect to the server. Please check your network.");
      } else {
        setMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <div className="rounded-xl flex items-center justify-center text-white text-2xl font-bold size-full">
            <img src="../../public/Quick_Service_Logos/full-logo/quick-service-full-128.png" alt="Quick Service Logo" />
          </div>
        </div>

        {/* Header Text */}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-blue-950">
          Register your account
        </h2>
        <p className="mt-2 mb-6 text-center text-sm text-slate-600">
          Get started with your free account today
          {/* Sign in to access your dashboard and services */}x
        </p>
      </div>
          
          {/* Status Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
                isError
                  ? "bg-red-50 text-red-700 border border-red-200/60"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              }`}
            >
              <span className="text-base">{isError ? "⚠️" : "✓"}</span>
              <p>{message}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone number
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength="10"
                  inputMode="numeric"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  autoComplete="tel"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Enter a 10-digit mobile number.</p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-12 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Must be at least 6 characters long.</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-12 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                required
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 text-sm cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2.5 block text-sm text-slate-600 cursor-pointer select-none">
                I agree to the{" "}
                <Link to="/terms" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                  Terms & Conditions
                </Link>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm bg-orange-600 transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
                Or
              </span>
            </div>
          </div>

          {/* Login Callout */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;