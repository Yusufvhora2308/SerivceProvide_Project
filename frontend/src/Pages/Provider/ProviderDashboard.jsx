// PATH: src/Pages/Provider/ProviderDashboard.jsx

import React, { useEffect, useState } from "react";
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
  ArrowRight,
  BriefcaseBusiness,
  TrendingUp,
  MapPin,
  Bell,
  ShieldCheck,
} from "lucide-react";

import api from "../../api/axios";
import Swal from "sweetalert2";

const ProviderDashboard = () => {
  const navigate = useNavigate();

  // =========================================================
  // STATES
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  const [provider, setProvider] = useState(null);

  const [statusLoading, setStatusLoading] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);

  const [providerLocation, setProviderLocation] = useState(null);

  const [locationError, setLocationError] = useState("");

  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    earnings: 0,
    rating: 0,
  });

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      setUser(storedUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }

    fetchDashboardData();
  }, []);

  // =========================================================
  // FETCH DASHBOARD DATA
  // =========================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/provider/dashboard"
      );

      console.log(
        "Dashboard response:",
        response.data
      );

      if (response.data.success) {
        const providerData =
          response.data.provider;

        setProvider(providerData);

        setStats({
          totalJobs:
            providerData.total_jobs || 0,

          pendingJobs:
            providerData.pending_jobs || 0,

          completedJobs:
            providerData.completed_jobs || 0,

          earnings:
            providerData.earnings || 0,

          rating:
            providerData.rating || 0,
        });

        // -----------------------------------------------------
        // Existing provider location
        // -----------------------------------------------------

        if (
          providerData.latitude !== null &&
          providerData.latitude !== undefined &&
          providerData.longitude !== null &&
          providerData.longitude !== undefined
        ) {
          setProviderLocation({
            latitude: Number(providerData.latitude),
            longitude: Number(providerData.longitude),
          });
        }
      }
    } catch (error) {
      console.error(
        "Dashboard fetch error:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Unable to load dashboard",
        text:
          error.response?.data?.message ||
          "Failed to load dashboard data.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET CURRENT GPS LOCATION
  // =========================================================

  const getCurrentLocation = () => {
    return new Promise(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(
            new Error(
              "Geolocation is not supported by this browser."
            )
          );

          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,
            };

            console.log(
              "Current Provider Location:",
              location
            );

            resolve(location);
          },

          (error) => {
            console.error(
              "Location Error:",
              error
            );

            let message =
              "Unable to get your location.";

            if (error.code === 1) {
              message =
                "Location permission denied. Please allow location access.";
            } else if (error.code === 2) {
              message =
                "Location information is unavailable.";
            } else if (error.code === 3) {
              message =
                "Location request timed out.";
            }

            reject(
              new Error(message)
            );
          },

          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    );
  };

  // =========================================================
  // UPDATE PROVIDER LOCATION API
  // =========================================================

  const updateProviderLocation = async (
    latitude,
    longitude
  ) => {
    try {
      const response = await api.put(
        "/provider/location",
        {
          latitude,
          longitude,
        }
      );

      console.log(
        "Location API Response:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error(
        "Location Update Error:",
        error.response?.data || error
      );

      throw error;
    }
  };

  // =========================================================
  // GET GPS + SAVE LOCATION
  // =========================================================

  const trackProviderLocation = async (
    showError = false
  ) => {
    try {
      const location =
        await getCurrentLocation();

      // Update frontend location
      setProviderLocation(location);

      setLocationError("");

      // Save location in database
      const response =
        await updateProviderLocation(
          location.latitude,
          location.longitude
        );

      console.log(
        "Provider Location Updated:",
        response
      );

      return response;
    } catch (error) {
      console.error(
        "Provider Location Tracking Error:",
        error
      );

      setLocationError(
        error.message ||
          "Unable to update your location."
      );

      if (showError) {
        throw error;
      }

      return null;
    }
  };

  // =========================================================
  // LIVE PROVIDER GPS TRACKING
  // =========================================================
  //
  // Provider online:
  // 1. Browser continuously watches GPS position
  // 2. First position is sent immediately
  // 3. New position is sent to Laravel when provider moves
  // 4. API calls are limited to once every 10 seconds
  //
  // Provider offline:
  // Stop GPS watcher
  //
  // =========================================================

  useEffect(() => {
    if (!provider?.is_online) {
      console.log(
        "Provider is OFFLINE - GPS tracking is stopped."
      );

      return;
    }

    if (!navigator.geolocation) {
      const message =
        "Geolocation is not supported by this browser.";

      console.error(message);
      setLocationError(message);

      return;
    }

    console.log(
      "Provider is ONLINE - starting live GPS tracking."
    );

    let watchId = null;
    let lastSentAt = 0;
    let isSending = false;

    const sendLocation = async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const now = Date.now();

      // Do not send too many API requests.
      // Maximum: one request every 10 seconds.
      if (
        lastSentAt !== 0 &&
        now - lastSentAt < 10000
      ) {
        setProviderLocation({
          latitude,
          longitude,
        });

        return;
      }

      if (isSending) {
        return;
      }

      isSending = true;

      const location = {
        latitude,
        longitude,
      };

      console.log(
        "📍 Live Provider GPS:",
        location
      );

      // Update UI immediately
      setProviderLocation(location);
      setLocationError("");

      try {
        const response =
          await updateProviderLocation(
            latitude,
            longitude
          );

        lastSentAt = Date.now();

        console.log(
          "✅ Live location sent to Laravel:",
          response
        );
      } catch (error) {
        console.error(
          "❌ Live location update failed:",
          error.response?.data || error.message
        );

        setLocationError(
          error.response?.data?.message ||
            "Unable to update your live location."
        );
      } finally {
        isSending = false;
      }
    };

    // -------------------------------------------------------
    // START CONTINUOUS GPS WATCH
    // -------------------------------------------------------

    watchId =
      navigator.geolocation.watchPosition(
        sendLocation,

        (error) => {
          console.error(
            "❌ Live GPS Error:",
            error
          );

          let message =
            "Unable to get your live location.";

          if (error.code === 1) {
            message =
              "Location permission denied. Please allow location access.";
          } else if (error.code === 2) {
            message =
              "Location information is unavailable.";
          } else if (error.code === 3) {
            message =
              "Location request timed out.";
          }

          setLocationError(message);
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );

    // -------------------------------------------------------
    // CLEANUP GPS WATCH
    // -------------------------------------------------------

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(
          watchId
        );

        console.log(
          "🛑 Provider live GPS tracking stopped."
        );
      }
    };
  }, [provider?.is_online]);

  // =========================================================
  // UPDATE PROVIDER ONLINE / OFFLINE STATUS
  // =========================================================

  const updateProviderStatus = async () => {
    if (!provider) return;

    try {
      setStatusLoading(true);

      // Current status reverse
      const newStatus =
        !provider.is_online;

      // =====================================================
      // GOING ONLINE
      // FIRST GET GPS LOCATION
      // =====================================================

      if (newStatus) {
        setLocationLoading(true);

        setLocationError("");

        // Get current location
        const location =
          await getCurrentLocation();

        // Save location in database
        await updateProviderLocation(
          location.latitude,
          location.longitude
        );

        // Update frontend location
        setProviderLocation(location);

        setLocationLoading(false);
      }

      // =====================================================
      // UPDATE ONLINE / OFFLINE STATUS
      // =====================================================

      const response = await api.post(
        "/provider/update-status",
        {
          is_online: newStatus,
        }
      );

      console.log(
        "Status API Response:",
        response.data
      );

      // =====================================================
      // UPDATE LOCAL STATE
      // =====================================================

      if (response.data.success) {
        setProvider(
          (previousProvider) => ({
            ...previousProvider,

            is_online:
              response.data.provider
                .is_online,

            availability_status:
              response.data.provider
                .availability_status,
          })
        );

        // =================================================
        // SUCCESS MESSAGE
        // =================================================

        Swal.fire({
          icon: "success",

          title:
            response.data.provider
              .is_online
              ? "You are Online"
              : "You are Offline",

          text:
            response.data.message,

          timer: 1500,

          showConfirmButton: false,

          confirmButtonColor: "#2563eb",
        });
      }
    } catch (error) {
      console.error(
        "Provider Status Error:",
        error.response?.data || error
      );

      Swal.fire({
        icon: "error",

        title:
          "Unable to Update Status",

        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong.",

        confirmButtonColor:
          "#2563eb",
      });
    } finally {
      setStatusLoading(false);

      setLocationLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    const result =
      await Swal.fire({
        title: "Logout?",

        text:
          "Are you sure you want to logout?",

        icon: "question",

        showCancelButton: true,

        confirmButtonColor:
          "#ef4444",

        cancelButtonColor:
          "#64748b",

        confirmButtonText:
          "Yes, Logout",

        cancelButtonText:
          "Cancel",
      });

    if (!result.isConfirmed) return;

    try {
      await api.post(
        "/provider/logout"
      );
    } catch (error) {
      console.error(
        "Logout API error:",
        error
      );
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("provider");
      localStorage.removeItem("remember");
      localStorage.removeItem("loginMessage");
      localStorage.removeItem("loginIsError");
      localStorage.removeItem("loginSuccess");

      sessionStorage.clear();

      navigate(
        "/provider/login",
        {
          replace: true,
        }
      );
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getUserInitial = () => {
    if (user?.name) {
      return user.name
        .charAt(0)
        .toUpperCase();
    }

    return "P";
  };

  // =========================================================
  // VERIFICATION STATUS BADGE
  // =========================================================

  const getStatusBadge = (
    status
  ) => {
    const styles = {
      approved: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border:
          "border-emerald-200",

        icon:
          <CheckCircle size={15} />,

        label:
          "Verified Provider",
      },

      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border:
          "border-amber-200",

        icon:
          <Clock size={15} />,

        label:
          "Verification Pending",
      },

      rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        border:
          "border-red-200",

        icon:
          <XCircle size={15} />,

        label:
          "Verification Rejected",
      },
    };

    return (
      styles[status] ||
      styles.pending
    );
  };

  const verificationStatus =
    provider?.verification_status ||
    "pending";

  const statusStyle =
    getStatusBadge(
      verificationStatus
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>

          <h3 className="text-lg font-semibold text-slate-800">
            Loading Dashboard
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            WELCOME SECTION
        ================================================= */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <p className="mb-1 text-sm font-medium text-blue-600">
              Provider Dashboard
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">

              Welcome back,{" "}
              {user?.name || "Provider"} 👋

            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your services, bookings and earnings from one place.
            </p>

          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

        {/* =================================================
            ONLINE / OFFLINE STATUS CARD
        ================================================= */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            {/* Left Side */}

            <div className="flex items-center gap-4">

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  provider?.is_online
                    ? "bg-emerald-50"
                    : "bg-red-50"
                }`}
              >

                <MapPin
                  size={26}
                  className={
                    provider?.is_online
                      ? "text-emerald-600"
                      : "text-red-500"
                  }
                />

              </div>

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Provider Availability
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      provider?.is_online
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  ></span>

                  <h3
                    className={`text-xl font-bold ${
                      provider?.is_online
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {provider?.is_online
                      ? "You are Online"
                      : "You are Offline"}
                  </h3>

                </div>

                <p className="mt-1 text-sm text-slate-500">

                  {provider?.is_online
                    ? "Customers can now find you nearby."
                    : "You are currently not visible to customers."}

                </p>

                {/* Live Location Information */}

                {provider?.is_online &&
                  providerLocation && (
                    <div className="mt-2">

                      <p className="text-xs text-emerald-600">
                        📍 Live location active
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {providerLocation.latitude.toFixed(
                          6
                        )}
                        ,{" "}
                        {providerLocation.longitude.toFixed(
                          6
                        )}
                      </p>

                    </div>
                  )}

                {/* Location Error */}

                {provider?.is_online &&
                  locationError && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {locationError}
                    </p>
                  )}

              </div>

            </div>

            {/* Online Offline Button */}

            <button
              onClick={updateProviderStatus}
              disabled={
                statusLoading ||
                locationLoading
              }
              className={`flex min-w-[170px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                provider?.is_online
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >

              {statusLoading ||
              locationLoading ? (
                <>
                  <RefreshCw
                    size={17}
                    className="animate-spin"
                  />

                  Updating...
                </>
              ) : provider?.is_online ? (
                <>
                  <XCircle size={18} />

                  Go Offline
                </>
              ) : (
                <>
                  <CheckCircle size={18} />

                  Go Online
                </>
              )}

            </button>

          </div>

        </div>

        {/* =================================================
            PROVIDER PROFILE CARD
        ================================================= */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              {/* Profile */}

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-600 ring-4 ring-blue-50">

                  {getUserInitial()}

                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="text-xl font-bold text-slate-900">
                      {user?.name || "Provider"}
                    </h3>

                    {verificationStatus ===
                      "approved" && (
                      <ShieldCheck
                        size={19}
                        className="text-blue-600"
                      />
                    )}

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {user?.email ||
                      "No email available"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">

                    <span className="flex items-center gap-1">
                      <User size={13} />
                      Service Provider
                    </span>

                    {user?.phone && (
                      <span>
                        📞 {user.phone}
                      </span>
                    )}

                  </div>

                </div>

              </div>

              {/* Verification Status */}

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
              >

                {statusStyle.icon}

                {statusStyle.label}

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Jobs */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Jobs
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.totalJobs}
                </p>

                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600">

                  <TrendingUp size={13} />

                  All service requests

                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                <ClipboardList
                  size={23}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>

          {/* Pending Jobs */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Pending Jobs
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.pendingJobs}
                </p>

                <p className="mt-2 text-xs font-medium text-amber-600">
                  Need your attention
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">

                <Clock
                  size={23}
                  className="text-amber-600"
                />

              </div>

            </div>

          </div>

          {/* Completed */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.completedJobs}
                </p>

                <p className="mt-2 text-xs font-medium text-emerald-600">
                  Successfully completed
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">

                <CheckCircle
                  size={23}
                  className="text-emerald-600"
                />

              </div>

            </div>

          </div>

          {/* Earnings */}

          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Earnings
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">

                  ₹
                  {Number(
                    stats.earnings || 0
                  ).toLocaleString("en-IN")}

                </p>

                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-purple-600">

                  <DollarSign size={13} />

                  Service income

                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">

                <DollarSign
                  size={23}
                  className="text-purple-600"
                />

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            CONTENT GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Quick Actions */}

          <div className="lg:col-span-2">

            <div className="mb-4">

              <h3 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h3>

              <p className="text-sm text-slate-500">
                Manage your provider account
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* My Services */}

              <button
                onClick={() =>
                  navigate(
                    "/provider/services"
                  )
                }
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                    <ClipboardList
                      size={21}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600">
                      My Services
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage your offered services
                    </p>

                  </div>

                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                />

              </button>

              {/* Bookings */}

              <button
                onClick={() =>
                  navigate(
                    "/provider/bookings"
                  )
                }
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">

                    <Calendar
                      size={21}
                      className="text-emerald-600"
                    />

                  </div>

                  <div>

                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-600">
                      Bookings
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      View and manage bookings
                    </p>

                  </div>

                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                />

              </button>

              {/* Profile */}

              <button
                onClick={() =>
                  navigate(
                    "/provider/profile"
                  )
                }
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">

                    <Settings
                      size={21}
                      className="text-purple-600"
                    />

                  </div>

                  <div>

                    <h4 className="font-bold text-slate-900 group-hover:text-purple-600">
                      Profile Settings
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      Update your provider profile
                    </p>

                  </div>

                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-purple-600"
                />

              </button>

              {/* Earnings */}

              <button
                onClick={() =>
                  navigate(
                    "/provider/earnings"
                  )
                }
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">

                    <DollarSign
                      size={21}
                      className="text-orange-600"
                    />

                  </div>

                  <div>

                    <h4 className="font-bold text-slate-900 group-hover:text-orange-600">
                      Earnings
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      Track your service income
                    </p>

                  </div>

                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-600"
                />

              </button>

            </div>

          </div>

          {/* Provider Performance */}

          <div>

            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Provider Performance
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">

                  <Star
                    size={30}
                    className="fill-amber-400 text-amber-400"
                  />

                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Average Rating
                </p>

                <p className="mt-1 text-4xl font-bold text-slate-900">

                  {Number(
                    stats.rating || 0
                  ).toFixed(1)}

                </p>

                <div className="mt-2 flex justify-center gap-1">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <=
                          Math.round(
                            stats.rating || 0
                          )
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    )
                  )}

                </div>

              </div>

              <div className="my-6 border-t border-slate-100"></div>

              <div className="space-y-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Completed Jobs
                  </span>

                  <span className="font-semibold text-slate-800">
                    {stats.completedJobs}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Pending Jobs
                  </span>

                  <span className="font-semibold text-slate-800">
                    {stats.pendingJobs}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Total Jobs
                  </span>

                  <span className="font-semibold text-slate-800">
                    {stats.totalJobs}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            VERIFICATION INFORMATION
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                <ShieldCheck size={20} />

              </div>

              <div>

                <h4 className="font-bold text-slate-900">
                  Provider Verification
                </h4>

                <p className="mt-1 text-sm text-slate-600">

                  Your provider account status is{" "}

                  <strong>
                    {statusStyle.label}
                  </strong>
                  .

                </p>

              </div>

            </div>

            {verificationStatus !==
              "approved" && (
              <button
                onClick={() =>
                  navigate(
                    "/provider/documents/edit"
                  )
                }
                className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >

                Update Documents

                <ArrowRight size={16} />

              </button>
            )}

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-8 border-t border-slate-200 pt-5 text-center">

          <p className="text-xs text-slate-400">

            © {new Date().getFullYear()}{" "}
            Service Portal. Provider Panel.

          </p>

        </div>

      </main>

    </div>
  );
};

export default ProviderDashboard;

