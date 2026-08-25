// PATH: src/Pages/Provider/ProviderDashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Settings,
  Calendar,
  ClipboardList,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";

export const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    earnings: 0,
    rating: 0,
  });

  useEffect(() => {
    // Load user from localStorage
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch provider dashboard data
      const response = await api.get("/provider/dashboard");
      
      console.log("Dashboard response:", response.data);
      
      if (response.data.success) {
        const providerData = response.data.provider;
        setProvider(providerData);
        
        // Update stats
        setStats({
          totalJobs: providerData.total_jobs || 0,
          pendingJobs: providerData.pending_jobs || 0,
          completedJobs: providerData.completed_jobs || 0,
          earnings: providerData.earnings || 0,
          rating: providerData.rating || 0,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setLoading(false);
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to load dashboard data.',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear all localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("provider");
      localStorage.removeItem("remember");
      localStorage.removeItem("loginMessage");
      localStorage.removeItem("loginIsError");
      localStorage.removeItem("loginSuccess");

      // Clear all session data
      sessionStorage.clear();

      // Navigate to provider login
      navigate("/provider/login", { replace: true });
    }
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "P";
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      approved: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-400",
        icon: <CheckCircle size={14} />,
        label: "Approved",
      },
      pending: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        icon: <Clock size={14} />,
        label: "Pending",
      },
      rejected: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: <XCircle size={14} />,
        label: "Rejected",
      },
    };
    return styles[status] || styles.pending;
  };

  const verificationStatus = provider?.verification_status || "pending";
  const statusStyle = getStatusBadge(verificationStatus);

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-5 lg:p-6 dark:bg-gray-900/70">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Provider Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              Welcome back, {user?.name || "Provider"} 👋
            </p>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 active:scale-95 shadow-lg shadow-red-600/25 dark:shadow-red-600/40"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Provider Status Card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-2xl font-bold text-blue-600 ring-4 ring-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-400">
                {getUserInitial()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.name || "Provider"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  {user?.email || "No email"}
                </p>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  {user?.phone || "No phone"}
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <div className="rounded-xl bg-slate-50 px-4 py-2 dark:bg-gray-700/50">
                <p className="text-xs text-slate-500 dark:text-gray-400">Status</p>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.icon}
                  {statusStyle.label}
                </div>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-slate-500 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                    <ClipboardList size={22} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Total Jobs</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats.totalJobs}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
                    <Clock size={22} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Pending Jobs</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {stats.pendingJobs}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                    <CheckCircle size={22} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Completed Jobs</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.completedJobs}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
                    <DollarSign size={22} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Earnings</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ${stats.earnings}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <button className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                      <ClipboardList size={21} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        My Services
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        Manage your services
                      </p>
                    </div>
                  </div>
                </button>

                <button className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                      <Calendar size={21} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        Bookings
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        View your bookings
                      </p>
                    </div>
                  </div>
                </button>

                <button className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
                      <Settings size={21} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        Profile Settings
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        Update your profile
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;