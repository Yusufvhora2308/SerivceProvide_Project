import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  User,
  X,
  Zap,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../api/axios";

const ProviderDashboard = () => {
  const navigate = useNavigate();

  // =========================
  // BASIC STATES
  // =========================
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);

  // =========================
  // PROVIDER STATUS
  // =========================
  const [statusLoading, setStatusLoading] = useState(false);

  // =========================
  // PROVIDER LOCATION
  // =========================
  const [providerLocation, setProviderLocation] = useState(null);
  const [providerLocationName, setProviderLocationName] = useState(
    "Location unavailable",
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // =========================
  // REQUEST STATES
  // =========================
  const [requestLoading, setRequestLoading] = useState(false);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [requestProcessingId, setRequestProcessingId] = useState(null);

  // =========================
  // REQUEST TIMER
  // =========================
  const [requestTimers, setRequestTimers] = useState({});

  // =========================
  // REQUEST LOCATIONS
  // =========================
  const [requestLocationNames, setRequestLocationNames] = useState({});

  // =========================
  // IGNORED REQUESTS
  // =========================
  const [ignoredRequestIds, setIgnoredRequestIds] = useState(() => {
    try {
      const saved = localStorage.getItem("provider_ignored_requests");

      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const ignoredRequestIdsRef = useRef([]);

  // =========================
  // KEEP REF UPDATED
  // =========================
  useEffect(() => {
    ignoredRequestIdsRef.current = ignoredRequestIds;
  }, [ignoredRequestIds]);

  // =========================
  // GET USER FROM LOCAL STORAGE
  // =========================
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("User localStorage error:", error);
    }
  }, []);

  // =========================
  // SAVE IGNORED REQUESTS
  // =========================
  const saveIgnoredRequests = (ids) => {
    try {
      localStorage.setItem("provider_ignored_requests", JSON.stringify(ids));
    } catch (error) {
      console.error("Unable to save ignored requests:", error);
    }
  };

  // =========================
  // REQUEST TIMER STORAGE
  // =========================
  const getRequestTimerStorage = () => {
    try {
      const saved = localStorage.getItem("provider_request_timers");

      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Unable to read request timers:", error);

      return {};
    }
  };

  const saveRequestTimerStorage = (timers) => {
    try {
      localStorage.setItem("provider_request_timers", JSON.stringify(timers));
    } catch (error) {
      console.error("Unable to save request timers:", error);
    }
  };

  // =========================
  // FETCH DASHBOARD
  // =========================
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("/provider/dashboard");

      const data = response.data?.data || response.data;

      setProvider(data?.provider || null);

      // Provider location
      const latitude = data?.provider?.latitude;
      const longitude = data?.provider?.longitude;

      if (
        latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined
      ) {
        const location = {
          latitude: Number(latitude),
          longitude: Number(longitude),
        };

        setProviderLocation(location);

        getLocationName(location.latitude, location.longitude, "provider");
      }

      setLoading(false);
    } catch (error) {
      console.error("Dashboard error:", error);

      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Dashboard Error",
        text:
          error?.response?.data?.message ||
          "Unable to load provider dashboard.",
      });
    }
  };

  // =========================
  // FETCH SERVICE REQUESTS
  // =========================
  const fetchServiceRequests = async () => {
    try {
      setRequestLoading(true);

      const response = await api.get("/provider/service-requests");

      const responseData = response.data;

      let requests = [];

      if (Array.isArray(responseData)) {
        requests = responseData;
      } else if (Array.isArray(responseData?.data)) {
        requests = responseData.data;
      } else if (Array.isArray(responseData?.requests)) {
        requests = responseData.requests;
      }

      // =========================================
      // ONLY NEW SEARCHING REQUESTS
      // =========================================
      const newRequests = requests.filter((request) => {
        const requestId = String(request.id);

        return (
          request.status === "searching" &&
          !ignoredRequestIdsRef.current.includes(requestId)
        );
      });

      // =========================================
      // TIMER STORAGE
      // =========================================
      const savedTimers = getRequestTimerStorage();

      const currentTime = Date.now();

      const updatedTimers = {};
      const validTimerStorage = {};
      const validRequests = [];

      const expiredIds = [];

      // =========================================
      // PROCESS EVERY REQUEST
      // =========================================
      newRequests.forEach((request) => {
        const requestId = String(request.id);

        let startTime = savedTimers[requestId];

        // -----------------------------------------
        // NEW REQUEST
        // -----------------------------------------
        if (!startTime) {
          startTime = currentTime;
        }

        // -----------------------------------------
        // ELAPSED TIME
        // -----------------------------------------
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

        const remainingSeconds = 300 - elapsedSeconds;

        // -----------------------------------------
        // EXPIRED
        // -----------------------------------------
        if (remainingSeconds <= 0) {
          expiredIds.push(requestId);
          return;
        }

        // -----------------------------------------
        // ACTIVE REQUEST
        // -----------------------------------------
        updatedTimers[requestId] = remainingSeconds;

        validTimerStorage[requestId] = startTime;

        validRequests.push(request);
      });

      // =========================================
      // SAVE EXPIRED REQUESTS AS IGNORED
      // =========================================
      if (expiredIds.length > 0) {
        const updatedIgnored = [
          ...new Set([...ignoredRequestIdsRef.current, ...expiredIds]),
        ];

        ignoredRequestIdsRef.current = updatedIgnored;

        setIgnoredRequestIds(updatedIgnored);

        saveIgnoredRequests(updatedIgnored);
      }

      // =========================================
      // SAVE TIMER STORAGE
      // =========================================
      saveRequestTimerStorage(validTimerStorage);

      // =========================================
      // UPDATE STATES
      // =========================================
      setServiceRequests(validRequests);

      setRequestTimers(updatedTimers);

      setRequestLoading(false);
    } catch (error) {
      console.error("Service requests error:", error);

      setRequestLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchDashboard();
    fetchServiceRequests();
  }, []);

  // =========================
  // REQUEST POLLING - 5 SEC
  // =========================
  useEffect(() => {
    const interval = setInterval(() => {
      fetchServiceRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // REQUEST COUNTDOWN
  // =========================
  useEffect(() => {
    const interval = setInterval(() => {
      const savedTimers = getRequestTimerStorage();
      const currentTime = Date.now();

      const updatedTimers = {};
      const expiredIds = [];

      Object.keys(savedTimers).forEach((id) => {
        const startTime = savedTimers[id];

        if (!startTime) {
          return;
        }

        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

        const remainingSeconds = 300 - elapsedSeconds;

        if (remainingSeconds <= 0) {
          expiredIds.push(id);
        } else {
          updatedTimers[id] = remainingSeconds;
        }
      });

      // Update timer UI
      setRequestTimers(updatedTimers);

      // =========================================
      // HANDLE EXPIRED REQUESTS
      // =========================================
      if (expiredIds.length > 0) {
        expiredIds.forEach(async (id) => {
          try {
            await api.post(`/provider/service-requests/${id}/expire`);

            console.log(`Request ${id} expired successfully.`);
          } catch (error) {
            console.log(
              `Request ${id} expiry failed or request is already unavailable.`,
              error?.response?.data?.message,
            );
          }
        });

        // Remove expired requests from UI
        setServiceRequests((previousRequests) =>
          previousRequests.filter(
            (request) => !expiredIds.includes(String(request.id)),
          ),
        );

        // Add expired requests to ignored list
        const updatedIgnored = [
          ...new Set([...ignoredRequestIdsRef.current, ...expiredIds]),
        ];

        ignoredRequestIdsRef.current = updatedIgnored;

        setIgnoredRequestIds(updatedIgnored);

        saveIgnoredRequests(updatedIgnored);

        // Remove expired timers
        expiredIds.forEach((id) => {
          delete savedTimers[id];
        });

        saveRequestTimerStorage(savedTimers);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // FORMAT TIMER
  // =========================
  const formatTimer = (seconds) => {
    const safeSeconds = Math.max(0, seconds || 0);

    const minutes = Math.floor(safeSeconds / 60);

    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // =========================
  // REMOVE REQUEST
  // =========================

  const handleRemoveRequest = async (requestId) => {
    const id = String(requestId);

    try {
      setRequestProcessingId(requestId);

      // Reject this provider's request in backend
      await api.post(`/provider/service-requests/${id}/reject`);

      // Remove request from UI
      setServiceRequests((prev) =>
        prev.filter((request) => String(request.id) !== id),
      );

      // Remove timer from state
      setRequestTimers((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      // Remove timer from localStorage
      const savedTimers = getRequestTimerStorage();

      delete savedTimers[id];

      saveRequestTimerStorage(savedTimers);

      // Keep hidden after refresh
      const updatedIgnored = [
        ...new Set([...ignoredRequestIdsRef.current, id]),
      ];

      ignoredRequestIdsRef.current = updatedIgnored;

      setIgnoredRequestIds(updatedIgnored);

      saveIgnoredRequests(updatedIgnored);

      await Swal.fire({
        icon: "success",
        title: "Request Cancelled",
        text: "You have cancelled this service request.",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Cancel request error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Cancel",
        text:
          error?.response?.data?.message ||
          "This request is no longer available.",
      });
    } finally {
      setRequestProcessingId(null);
    }
  };

  // =========================
  // ACCEPT REQUEST
  // =========================
  const handleAcceptRequest = async (requestId) => {
    const id = String(requestId);

    try {
      setRequestProcessingId(requestId);

      await api.post(`/provider/service-requests/${requestId}/accept`);

      // Remove from dashboard
      setServiceRequests((previousRequests) =>
        previousRequests.filter((request) => String(request.id) !== id),
      );

      // Remove timer from state
      setRequestTimers((previousTimers) => {
        const updatedTimers = {
          ...previousTimers,
        };

        delete updatedTimers[id];

        return updatedTimers;
      });

      // Remove timer from localStorage
      const savedTimers = getRequestTimerStorage();

      delete savedTimers[id];

      saveRequestTimerStorage(savedTimers);

      // Keep hidden after refresh
      const updatedIgnored = [
        ...new Set([...ignoredRequestIdsRef.current, id]),
      ];

      ignoredRequestIdsRef.current = updatedIgnored;

      setIgnoredRequestIds(updatedIgnored);

      saveIgnoredRequests(updatedIgnored);

      await Swal.fire({
        icon: "success",
        title: "Request Accepted",
        text: "You have accepted this service request.",
        timer: 1400,
        showConfirmButton: false,
      });

      navigate(`/provider/service-requests/${requestId}`);
    } catch (error) {
      console.error("Accept request error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Accept",
        text:
          error?.response?.data?.message ||
          "Something went wrong while accepting the request.",
      });
    } finally {
      setRequestProcessingId(null);
    }
  };

  // =========================
  // HAVERSINE DISTANCE
  // =========================
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (
      lat1 === null ||
      lat1 === undefined ||
      lon1 === null ||
      lon1 === undefined ||
      lat2 === null ||
      lat2 === undefined ||
      lon2 === null ||
      lon2 === undefined
    ) {
      return null;
    }

    const latitude1 = Number(lat1);
    const longitude1 = Number(lon1);
    const latitude2 = Number(lat2);
    const longitude2 = Number(lon2);

    if (
      Number.isNaN(latitude1) ||
      Number.isNaN(longitude1) ||
      Number.isNaN(latitude2) ||
      Number.isNaN(longitude2)
    ) {
      return null;
    }

    const R = 6371;

    const dLat = ((latitude2 - latitude1) * Math.PI) / 180;

    const dLon = ((longitude2 - longitude1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((latitude1 * Math.PI) / 180) *
        Math.cos((latitude2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // =========================
  // REVERSE GEOCODING
  // =========================
  const getLocationName = async (
    latitude,
    longitude,
    type = "provider",
    requestId = null,
  ) => {
    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      );

      if (!response.ok) {
        throw new Error("Unable to fetch location");
      }

      const data = await response.json();

      const address = data?.address || {};

      const locationName =
        address?.suburb ||
        address?.neighbourhood ||
        address?.road ||
        address?.city_district ||
        address?.city ||
        address?.town ||
        address?.village ||
        data?.display_name ||
        "Location unavailable";

      if (type === "provider") {
        setProviderLocationName(locationName);
      }

      if (type === "customer" && requestId) {
        setRequestLocationNames((previous) => ({
          ...previous,
          [requestId]: {
            customer: locationName,
          },
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);

      if (type === "provider") {
        setProviderLocationName("Location unavailable");
      }

      if (type === "customer" && requestId) {
        setRequestLocationNames((previous) => ({
          ...previous,
          [requestId]: {
            customer: "Location unavailable",
          },
        }));
      }
    }
  };

  // =========================
  // CUSTOMER LOCATION GEOCODING
  // =========================
  useEffect(() => {
    serviceRequests.forEach((request) => {
      const latitude = request.latitude;
      const longitude = request.longitude;

      if (
        latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined &&
        !requestLocationNames?.[request.id]
      ) {
        getLocationName(latitude, longitude, "customer", request.id);
      }
    });
  }, [serviceRequests]);

  // =========================
  // GET CURRENT PROVIDER GPS
  // =========================
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");

      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;

        const longitude = position.coords.longitude;

        const location = {
          latitude,
          longitude,
        };

        setProviderLocation(location);

        await getLocationName(latitude, longitude, "provider");

        try {
          await api.put("/provider/location", {
            latitude,
            longitude,
          });
        } catch (error) {
          console.error("Provider location update error:", error);
        }

        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);

        setLocationLoading(false);

        setLocationError("Unable to get your current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // =========================
  // GET LOCATION WHEN ONLINE
  // =========================
  useEffect(() => {
    if (!provider?.is_online) {
      return;
    }

    getCurrentLocation();

    const interval = setInterval(() => {
      getCurrentLocation();
    }, 10000);

    return () => clearInterval(interval);
  }, [provider?.is_online]);

  // =========================
  // ONLINE / OFFLINE STATUS
  // =========================
  const updateProviderStatus = async () => {
    if (!provider) return;

    try {
      setStatusLoading(true);

      const newStatus = !provider.is_online;

      const response = await api.post("/provider/update-status", {
        is_online: newStatus,
        availability_status: newStatus ? "online" : "offline",
      });

      const updatedProvider = response.data?.provider ||
        response.data?.data?.provider ||
        response.data?.data || {
          ...provider,
          is_online: newStatus,
          availability_status: newStatus ? "online" : "offline",
        };

      setProvider(updatedProvider);

      if (newStatus) {
        getCurrentLocation();
      }

      Swal.fire({
        icon: "success",
        title: newStatus ? "You are Online" : "You are Offline",
        text: newStatus
          ? "You can now receive new service requests."
          : "You will not receive new service requests.",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Provider status update error:", error);

      Swal.fire({
        icon: "error",
        title: "Status Update Failed",
        text:
          error?.response?.data?.message ||
          "Unable to update your online status.",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // =========================
  // REFRESH
  // =========================
  const handleRefresh = async () => {
    await Promise.all([fetchDashboard(), fetchServiceRequests()]);
  };

  // =========================
  // INITIAL LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto" />

          <p className="mt-3 text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* =========================================
            HEADER
        ========================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            {/* LEFT SIDE */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Welcome, {user?.name || "Provider"}
                </h1>

                {provider?.verification_status === "approved" && (
                  <BadgeCheck size={21} className="text-blue-600" />
                )}
              </div>

              <p className="text-gray-500 text-sm mt-1">
                Manage your services and incoming requests
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">
              {/* REFRESH */}
              <button
                onClick={handleRefresh}
                className="p-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition"
                title="Refresh"
              >
                <RefreshCw
                  size={19}
                  className={
                    requestLoading
                      ? "animate-spin text-blue-600"
                      : "text-gray-600"
                  }
                />
              </button>

              {/* ONLINE / OFFLINE TOGGLE */}
              <button
                onClick={updateProviderStatus}
                disabled={statusLoading}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition disabled:opacity-60"
              >
                <span className="text-sm font-semibold text-gray-700">
                  {statusLoading
                    ? "Updating..."
                    : provider?.is_online
                      ? "Online"
                      : "Offline"}
                </span>

                <span
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    provider?.is_online ? "bg-green-500" : "bg-black"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      provider?.is_online ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            PROVIDER LOCATION
        ========================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Navigation size={19} className="text-blue-600" />
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Your Current Location
                </p>

                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {providerLocationName}
                </p>

                {providerLocation && (
                  <p className="text-xs text-gray-400 mt-1">
                    {providerLocation.latitude.toFixed(5)},{" "}
                    {providerLocation.longitude.toFixed(5)}
                  </p>
                )}

                {locationError && (
                  <p className="text-xs text-red-500 mt-1">{locationError}</p>
                )}
              </div>
            </div>

            <button
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Navigation
                size={16}
                className={locationLoading ? "animate-pulse" : ""}
              />

              {locationLoading ? "Updating..." : "Update Location"}
            </button>
          </div>
        </div>

        {/* =========================================
            NEW SERVICE REQUESTS
        ========================================= */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />

                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  New Service Requests
                </h2>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                New customer requests available for you
              </p>
            </div>

            {serviceRequests.length > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                {serviceRequests.length} New
              </span>
            )}
          </div>
        </div>

        {/* =========================================
            NO REQUESTS
        ========================================= */}
        {serviceRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
              <Briefcase size={28} className="text-blue-600" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mt-4">
              No New Requests
            </h3>

            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              New customer service requests will appear here when you are
              online.
            </p>

            <button
              onClick={handleRefresh}
              className="mt-5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition inline-flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        ) : (
          /* =========================================
             REQUEST CARDS
          ========================================= */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {serviceRequests.map((request) => {
              const requestId = String(request.id);

              const timer = requestTimers[requestId] ?? 300;

              const customerLatitude = request.latitude;

              const customerLongitude = request.longitude;

              const distance = calculateDistance(
                providerLocation?.latitude,
                providerLocation?.longitude,
                customerLatitude,
                customerLongitude,
              );

              const customerLocation =
                requestLocationNames?.[request.id]?.customer ||
                "Finding location...";

              const customerName =
                request.customer?.name || request.user?.name || "Customer";

              const customerPhone =
                request.customer?.phone || request.user?.phone || null;

              const serviceName = request.service?.name || "Service";

              const basePrice = Number(request.service?.base_price || 0);

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* CARD HEADER */}
                  <div className="px-4 py-3.5 border-b border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      {/* SERVICE */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Zap size={19} className="text-blue-600" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 truncate">
                            {serviceName}
                          </h3>

                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Request #{request.id}
                          </p>
                        </div>
                      </div>

                      {/* TIMER */}
                      <div
                        className={`px-2.5 py-1.5 rounded-lg text-center flex-shrink-0 ${
                          timer <= 60
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock size={13} />

                          <span className="font-bold text-xs">
                            {formatTimer(timer)}
                          </span>
                        </div>

                        <p className="text-[9px] mt-0.5">response</p>
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-4">
                    {/* CUSTOMER */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={17} className="text-gray-700" />
                        </div>

                        <div>
                          <p className="text-[11px] text-gray-400">Customer</p>

                          <p className="text-sm font-semibold text-gray-800">
                            {customerName}
                          </p>
                        </div>
                      </div>

                      {customerPhone && (
                        <a
                          href={`tel:${customerPhone}`}
                          className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition"
                          title="Call Customer"
                        >
                          <Phone size={16} />
                        </a>
                      )}
                    </div>

                    {/* PRICE + DISTANCE */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* PRICE */}
                      <div className="bg-blue-50 rounded-xl px-3.5 py-3">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-blue-600" />

                          <span className="text-[11px] text-gray-500">
                            Service Price
                          </span>
                        </div>

                        <p className="text-lg font-bold text-blue-700 mt-1">
                          ₹{basePrice.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* DISTANCE */}
                      <div className="bg-green-50 rounded-xl px-3.5 py-3">
                        <div className="flex items-center gap-2">
                          <Activity size={16} className="text-green-600" />

                          <span className="text-[11px] text-gray-500">
                            Distance
                          </span>
                        </div>

                        <p className="text-lg font-bold text-green-700 mt-1">
                          {distance !== null
                            ? `${distance.toFixed(2)} km`
                            : "Calculating..."}
                        </p>
                      </div>
                    </div>

                    {/* LOCATIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {/* CUSTOMER LOCATION */}
                      <div className="border border-gray-100 rounded-xl p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <MapPin size={16} className="text-blue-600" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                              Customer Location
                            </p>

                            <p className="text-xs font-medium text-gray-700 mt-1 line-clamp-2">
                              {customerLocation}
                            </p>

                            {customerLatitude !== null &&
                              customerLatitude !== undefined &&
                              customerLongitude !== null &&
                              customerLongitude !== undefined && (
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {Number(customerLatitude).toFixed(5)},{" "}
                                  {Number(customerLongitude).toFixed(5)}
                                </p>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* PROVIDER LOCATION */}
                      <div className="border border-gray-100 rounded-xl p-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Navigation size={16} className="text-gray-700" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                              Your Location
                            </p>

                            <p className="text-xs font-medium text-gray-700 mt-1 line-clamp-2">
                              {providerLocationName || "Location unavailable"}
                            </p>

                            {providerLocation && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                {providerLocation.latitude.toFixed(5)},{" "}
                                {providerLocation.longitude.toFixed(5)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PROBLEM */}
                    {(request.problem_description || request.problem) && (
                      <div className="mb-4 bg-gray-50 rounded-xl px-3.5 py-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <AlertCircle size={15} className="text-red-500" />

                          <p className="text-xs font-semibold text-gray-700">
                            Problem
                          </p>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {request.problem_description || request.problem}
                        </p>
                      </div>
                    )}

                    {/* SCHEDULE */}
                    {request.scheduled_at && (
                      <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3.5 py-2.5 mb-4">
                        <Clock size={15} className="text-blue-600" />

                        <div>
                          <p className="text-[10px] text-blue-500">
                            Scheduled For
                          </p>

                          <p className="text-xs font-semibold text-blue-700">
                            {new Date(request.scheduled_at).toLocaleString(
                              "en-IN",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* BUTTONS */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* REMOVE */}
                      <button
                        onClick={() => handleRemoveRequest(request.id)}
                        disabled={requestProcessingId === request.id}
                        className="py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                      >
                        <X size={16} />
                        Cansel
                      </button>

                      {/* ACCEPT */}
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={requestProcessingId === request.id}
                        className="py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                      >
                        {requestProcessingId === request.id ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Accept
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
