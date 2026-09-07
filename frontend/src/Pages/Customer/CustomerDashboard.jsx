// PATH: src/Pages/Customer/CustomerDashboard.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  ArrowRight,
  Wrench,
  Zap,
  Droplets,
  Monitor,
  Tv,
  Sparkles,
  Hammer,
  MoreHorizontal,
  RefreshCw,
  X,
  MapPin,
  Star,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import api from "../../api/axios";

/*
|--------------------------------------------------------------------------
| Leaflet Default Marker Fix
|--------------------------------------------------------------------------
*/

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/*
|--------------------------------------------------------------------------
| Customer Dashboard
|--------------------------------------------------------------------------
*/

const CustomerDashboard = () => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Services
  |--------------------------------------------------------------------------
  */

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState("");

  const [selectedService, setSelectedService] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Customer Location
  |--------------------------------------------------------------------------
  */

  const [customerLocation, setCustomerLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Nearby Providers
  |--------------------------------------------------------------------------
  */

  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const [lastProviderRefresh, setLastProviderRefresh] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Booking Modal
  |--------------------------------------------------------------------------
  */

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Booking Form
  |--------------------------------------------------------------------------
  */

const [bookingForm, setBookingForm] = useState({
  address: "",
  problem_description: "",
  request_type: "now",
  scheduled_at: "",
});

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | User
  |--------------------------------------------------------------------------
  */

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 18) {
      return "Good Afternoon";
    }

    return "Good Evening";
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Service Icons
  |--------------------------------------------------------------------------
  */

  const serviceIcons = {
    electrician: Zap,
    electrical: Zap,
    plumber: Droplets,
    plumbing: Droplets,
    ac: Sparkles,
    "ac repair": Sparkles,
    appliance: Tv,
    tv: Tv,
    computer: Monitor,
    laptop: Monitor,
    carpenter: Hammer,
    carpentry: Hammer,
    repair: Wrench,
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch Services
  |--------------------------------------------------------------------------
  */

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      setServiceError("");

      const response = await api.get("/services");

      const serviceData =
        response.data?.data ||
        response.data?.services ||
        [];

      setServices(Array.isArray(serviceData) ? serviceData : []);
    } catch (error) {
      console.error("Fetch Services Error:", error);

      setServiceError(
        error.response?.data?.message ||
          "Unable to load services."
      );
    } finally {
      setLoadingServices(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Get Customer Location
  |--------------------------------------------------------------------------
  */

  const getCustomerLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCustomerLocation({
          latitude,
          longitude,
        });

        setLocationError("");
      },
      (error) => {
        console.error("Location Error:", error);

        setLocationError(
          "Unable to get your current location. Please allow location access."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Get Nearby Providers
  |--------------------------------------------------------------------------
  */

  const getNearbyProviders = async (
    latitude,
    longitude,
    serviceId = null
  ) => {
    if (!latitude || !longitude) {
      return;
    }

    try {
      setLoadingProviders(true);

      const params = {
        latitude,
        longitude,
        radius: 10,
      };

      if (serviceId) {
        params.service_id = serviceId;
      }

      const response = await api.get(
        "/customer/nearby-providers",
        {
          params,
        }
      );

      const providers =
        response.data?.data ||
        response.data?.providers ||
        [];

      setNearbyProviders(
        Array.isArray(providers) ? providers : []
      );

      setLastProviderRefresh(new Date());
    } catch (error) {
      console.error(
        "Nearby Providers Error:",
        error
      );

      setNearbyProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchServices();
    getCustomerLocation();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Nearby Providers After Location
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!customerLocation) {
      return;
    }

    getNearbyProviders(
      customerLocation.latitude,
      customerLocation.longitude,
      selectedService?.id || null
    );
  }, [customerLocation, selectedService]);

  /*
  |--------------------------------------------------------------------------
  | Live Provider Refresh - Every 10 Seconds
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!customerLocation) {
      return;
    }

    const interval = setInterval(() => {
      getNearbyProviders(
        customerLocation.latitude,
        customerLocation.longitude,
        selectedService?.id || null
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [customerLocation, selectedService]);

  /*
  |--------------------------------------------------------------------------
  | Filter Services
  |--------------------------------------------------------------------------
  */

  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        const serviceName =
          service.name ||
          service.service_name ||
          "";

        return serviceName
          .toLowerCase()
          .includes(search.toLowerCase());
      })
      .slice(0, 4);
  }, [services, search]);

  /*
  |--------------------------------------------------------------------------
  | Get Service Icon
  |--------------------------------------------------------------------------
  */

  const getServiceIcon = (service) => {
    const name = (
      service.name ||
      service.service_name ||
      ""
    ).toLowerCase();

    const matchedKey = Object.keys(serviceIcons).find(
      (key) => name.includes(key)
    );

    return matchedKey
      ? serviceIcons[matchedKey]
      : Wrench;
  };

  /*
  |--------------------------------------------------------------------------
  | Select Service
  |--------------------------------------------------------------------------
  */

  const handleServiceClick = (service) => {
    setSelectedService(service);

    if (customerLocation) {
      getNearbyProviders(
        customerLocation.latitude,
        customerLocation.longitude,
        service.id
      );
    }

    setTimeout(() => {
      document
        .getElementById("nearby-providers")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }, 100);
  };

  /*
  |--------------------------------------------------------------------------
  | Clear Selected Service
  |--------------------------------------------------------------------------
  */

  const clearSelectedService = () => {
    setSelectedService(null);

    if (customerLocation) {
      getNearbyProviders(
        customerLocation.latitude,
        customerLocation.longitude
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | View Provider
  |--------------------------------------------------------------------------
  */

  const handleViewProvider = (provider) => {
    navigate(
      `/customer/providers/${provider.id}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Book Now
  |--------------------------------------------------------------------------
  */

  const handleBookNow = (provider) => {
    if (!selectedService) {
      return;
    }

    setSelectedProvider(provider);

    setBookingForm({
      address: "",
      problem_description: "",
      request_type: "instant",
      scheduled_at: "",
    });

    setBookingError("");
    setBookingSuccess("");

    setShowBookingModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Close Booking Modal
  |--------------------------------------------------------------------------
  */

  const closeBookingModal = () => {
    if (bookingLoading) {
      return;
    }

    setShowBookingModal(false);
    setSelectedProvider(null);
    setBookingError("");
    setBookingSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | Booking Form Change
  |--------------------------------------------------------------------------
  */

  const handleBookingChange = (e) => {
    const { name, value } = e.target;

    setBookingForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setBookingError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Create Booking
  |--------------------------------------------------------------------------
  */

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    if (!selectedService || !selectedProvider) {
      setBookingError(
        "Service or provider is not selected."
      );
      return;
    }

    if (!customerLocation) {
      setBookingError(
        "Your current location is required for booking."
      );
      return;
    }

    if (!bookingForm.address.trim()) {
      setBookingError(
        "Please enter your service address."
      );
      return;
    }

    if (
      bookingForm.request_type === "scheduled" &&
      !bookingForm.scheduled_at
    ) {
      setBookingError(
        "Please select scheduled date and time."
      );
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");
      setBookingSuccess("");

      const payload = {
        service_id: selectedService.id,
        provider_id: selectedProvider.id,

        address: bookingForm.address.trim(),

        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,

        problem_description:
          bookingForm.problem_description.trim() ||
          null,

        request_type: bookingForm.request_type,

        scheduled_at:
          bookingForm.request_type === "scheduled"
            ? bookingForm.scheduled_at
            : null,
      };

      console.log(
        "Creating Booking:",
        payload
      );

      const response = await api.post(
        "/customer/service-requests",
        payload
      );

      console.log(
        "Booking Response:",
        response.data
      );

      if (response.data?.success) {
        setBookingSuccess(
          "Booking Created Successfully!"
        );

        setTimeout(() => {
          setShowBookingModal(false);
          setSelectedProvider(null);

          navigate("/customer/my-requests");
        }, 1200);
      } else {
        setBookingError(
          response.data?.message ||
            "Unable to create booking."
        );
      }
    } catch (error) {
      console.error(
        "Create Booking Error:",
        error
      );

      /*
      |--------------------------------------------------------------------------
      | Laravel Validation Error
      |--------------------------------------------------------------------------
      */

      if (error.response?.status === 422) {
        const errors =
          error.response?.data?.errors;

        if (errors) {
          const firstError =
            Object.values(errors)[0]?.[0];

          setBookingError(
            firstError ||
              "Please check your booking details."
          );
        } else {
          setBookingError(
            error.response?.data?.message ||
              "Please check your booking details."
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Unauthorized
      |--------------------------------------------------------------------------
      */

      else if (
        error.response?.status === 401
      ) {
        setBookingError(
          "Your session has expired. Please login again."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Other Errors
      |--------------------------------------------------------------------------
      */

      else {
        setBookingError(
          error.response?.data?.message ||
            "Unable to create booking. Please try again."
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Manual Provider Refresh
  |--------------------------------------------------------------------------
  */

  const handleRefreshProviders = () => {
    if (!customerLocation) {
      getCustomerLocation();
      return;
    }

    getNearbyProviders(
      customerLocation.latitude,
      customerLocation.longitude,
      selectedService?.id || null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Provider Coordinates
  |--------------------------------------------------------------------------
  */

  const getProviderLatitude = (provider) => {
    return Number(
      provider.latitude ??
        provider.provider?.latitude ??
        provider.location?.latitude
    );
  };

  const getProviderLongitude = (provider) => {
    return Number(
      provider.longitude ??
        provider.provider?.longitude ??
        provider.location?.longitude
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Provider Name
  |--------------------------------------------------------------------------
  */

  const getProviderName = (provider) => {
    return (
      provider.name ||
      provider.provider_name ||
      provider.user?.name ||
      provider.provider?.name ||
      "Service Provider"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Provider Rating
  |--------------------------------------------------------------------------
  */

  const getProviderRating = (provider) => {
    return (
      provider.rating ??
      provider.average_rating ??
      provider.provider?.rating ??
      0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Provider Distance
  |--------------------------------------------------------------------------
  */

  const getProviderDistance = (provider) => {
    const distance =
      provider.distance ??
      provider.distance_km ??
      provider.provider?.distance;

    if (
      distance === null ||
      distance === undefined
    ) {
      return null;
    }

    return Number(distance).toFixed(2);
  };

  /*
  |--------------------------------------------------------------------------
  | Provider Availability
  |--------------------------------------------------------------------------
  */

  const getProviderStatus = (provider) => {
    return (
      provider.availability_status ||
      provider.status ||
      provider.provider?.availability_status ||
      (provider.is_online ? "online" : "offline")
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Provider Services
  |--------------------------------------------------------------------------
  */

  const getProviderServices = (provider) => {
    return (
      provider.services ||
      provider.provider_services ||
      provider.provider?.services ||
      []
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================================================================
          HEADER
      ================================================================ */}

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>
              <p className="text-sm text-gray-500 mb-1">
                {greeting}
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                Hello, {user?.name || "Customer"} 👋
              </h1>

              <p className="text-gray-500 mt-2">
                Find trusted service providers near you.
              </p>
            </div>

            <div className="relative w-full md:w-80">

              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

        </div>
      </div>

      {/* ================================================================
          MAIN CONTENT
      ================================================================ */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ==============================================================
            SERVICES
        ============================================================== */}

        <section>

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                What service do you need?
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Select a service to find nearby providers.
              </p>
            </div>

            <button
              onClick={fetchServices}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Refresh Services"
            >
              <RefreshCw
                size={18}
                className={
                  loadingServices
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

          </div>

          {serviceError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {serviceError}
            </div>
          )}

          {loadingServices ? (

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 bg-gray-200 rounded-2xl animate-pulse"
                />
              ))}

            </div>

          ) : (

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {filteredServices.map((service) => {

                const Icon =
                  getServiceIcon(service);

                const isSelected =
                  selectedService?.id ===
                  service.id;

                return (
                  <button
                    key={service.id}
                    onClick={() =>
                      handleServiceClick(service)
                    }
                    className={`text-left p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 shadow-md"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >

                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Icon size={24} />
                    </div>

                    <h3 className="font-semibold text-gray-900">
                      {service.name ||
                        service.service_name ||
                        "Service"}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Find nearby providers
                    </p>

                  </button>
                );
              })}

            </div>

          )}

        </section>

        {/* ==============================================================
            SELECTED SERVICE
        ============================================================== */}

        {selectedService && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                {React.createElement(
                  getServiceIcon(selectedService),
                  { size: 20 }
                )}
              </div>

              <div>
                <p className="text-xs text-blue-600 font-medium">
                  Selected Service
                </p>

                <p className="font-semibold text-gray-900">
                  {selectedService.name ||
                    selectedService.service_name}
                </p>
              </div>

            </div>

            <button
              onClick={clearSelectedService}
              className="p-2 hover:bg-blue-100 rounded-lg"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* ==============================================================
            LOCATION STATUS
        ============================================================== */}

        <section className="mt-8">

          {locationError ? (

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3">

              <AlertCircle
                size={20}
                className="text-yellow-600"
              />

              <div className="flex-1">
                <p className="font-medium text-yellow-800">
                  Location unavailable
                </p>

                <p className="text-sm text-yellow-700">
                  {locationError}
                </p>
              </div>

              <button
                onClick={getCustomerLocation}
                className="text-sm font-medium text-yellow-800 hover:underline"
              >
                Try Again
              </button>

            </div>

          ) : customerLocation ? (

            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">

              <MapPin
                size={20}
                className="text-green-600"
              />

              <div>
                <p className="font-medium text-green-800">
                  Your location is active
                </p>

                <p className="text-xs text-green-700">
                  Nearby providers are shown based on your current location.
                </p>
              </div>

            </div>

          ) : (

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              Getting your current location...
            </div>

          )}

        </section>

        {/* ==============================================================
            MAP
        ============================================================== */}

        <section className="mt-8">

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

            <div className="px-5 py-4 border-b flex items-center justify-between">

              <div>
                <h2 className="font-bold text-gray-900">
                  Providers Near You
                </h2>

                <p className="text-sm text-gray-500">
                  Within 10 km radius
                </p>
              </div>

              <button
                onClick={handleRefreshProviders}
                disabled={loadingProviders}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <RefreshCw
                  size={18}
                  className={
                    loadingProviders
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>

            </div>

            <div className="h-[420px]">

              {customerLocation ? (

                <MapContainer
                  center={[
                    customerLocation.latitude,
                    customerLocation.longitude,
                  ]}
                  zoom={12}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >

                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={[
                      customerLocation.latitude,
                      customerLocation.longitude,
                    ]}
                  >
                    <Popup>
                      <div className="font-semibold">
                        Your Location
                      </div>
                    </Popup>
                  </Marker>

                  <Circle
                    center={[
                      customerLocation.latitude,
                      customerLocation.longitude,
                    ]}
                    radius={10000}
                  />

                  {nearbyProviders.map(
                    (provider) => {

                      const latitude =
                        getProviderLatitude(
                          provider
                        );

                      const longitude =
                        getProviderLongitude(
                          provider
                        );

                      if (
                        !Number.isFinite(
                          latitude
                        ) ||
                        !Number.isFinite(
                          longitude
                        )
                      ) {
                        return null;
                      }

                      return (
                        <Marker
                          key={
                            provider.id
                          }
                          position={[
                            latitude,
                            longitude,
                          ]}
                        >

                          <Popup>

                            <div className="min-w-[200px]">

                              <h3 className="font-bold text-gray-900">
                                {getProviderName(
                                  provider
                                )}
                              </h3>

                              <p className="text-sm text-gray-500 mt-1">
                                {selectedService?.name ||
                                  selectedService?.service_name ||
                                  "Service Provider"}
                              </p>

                              <button
                                onClick={() =>
                                  handleBookNow(
                                    provider
                                  )
                                }
                                className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                              >
                                Book Now
                              </button>

                            </div>

                          </Popup>

                        </Marker>
                      );
                    }
                  )}

                </MapContainer>

              ) : (

                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MapPin
                      size={40}
                      className="mx-auto mb-3 text-gray-400"
                    />
                    <p>
                      Waiting for your location...
                    </p>
                  </div>
                </div>

              )}

            </div>

          </div>

        </section>

        {/* ==============================================================
            NEARBY PROVIDERS
        ============================================================== */}

        <section
          id="nearby-providers"
          className="mt-10"
        >

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedService
                  ? `Nearby ${selectedService.name || selectedService.service_name} Providers`
                  : "Nearby Service Providers"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {lastProviderRefresh
                  ? `Updated ${lastProviderRefresh.toLocaleTimeString()}`
                  : "Available providers near your location"}
              </p>
            </div>

            {selectedService && (
              <button
                onClick={clearSelectedService}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                View All Providers
              </button>
            )}

          </div>

          {loadingProviders &&
          nearbyProviders.length === 0 ? (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 bg-gray-200 rounded-2xl animate-pulse"
                />
              ))}

            </div>

          ) : nearbyProviders.length === 0 ? (

            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

              <Wrench
                size={45}
                className="mx-auto text-gray-300 mb-4"
              />

              <h3 className="font-semibold text-gray-900 text-lg">
                No providers found
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                No nearby providers are currently available for this service.
              </p>

              <button
                onClick={handleRefreshProviders}
                className="mt-5 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {nearbyProviders.map(
                (provider) => {

                  const providerName =
                    getProviderName(
                      provider
                    );

                  const rating =
                    getProviderRating(
                      provider
                    );

                  const distance =
                    getProviderDistance(
                      provider
                    );

                  const status =
                    getProviderStatus(
                      provider
                    );

                  const providerServices =
                    getProviderServices(
                      provider
                    );

                  return (
                    <div
                      key={provider.id}
                      className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-shadow"
                    >

                      {/* Provider Header */}

                      <div className="flex items-start justify-between">

                        <div className="flex items-center gap-3">

                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                            {providerName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <h3 className="font-bold text-gray-900">
                              {providerName}
                            </h3>

                            <div className="flex items-center gap-2 mt-1">

                              <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                <Star
                                  size={14}
                                  fill="currentColor"
                                />

                                <span>
                                  {Number(
                                    rating
                                  ).toFixed(1)}
                                </span>
                              </div>

                              {distance !==
                                null && (
                                <>
                                  <span className="text-gray-300">
                                    •
                                  </span>

                                  <span className="text-xs text-gray-500">
                                    {distance} km
                                  </span>
                                </>
                              )}

                            </div>

                          </div>

                        </div>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            String(
                              status
                            ).toLowerCase() ===
                            "online"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {String(status)
                            .charAt(0)
                            .toUpperCase() +
                            String(status).slice(
                              1
                            )}
                        </span>

                      </div>

                      {/* Service */}

                      <div className="mt-4 p-3 bg-gray-50 rounded-xl">

                        <div className="flex items-center gap-2">

                          <Wrench
                            size={17}
                            className="text-blue-600"
                          />

                          <span className="text-sm font-medium text-gray-700">
                            {selectedService?.name ||
                              selectedService?.service_name ||
                              "Service"}
                          </span>

                        </div>

                      </div>

                      {/* Provider Services */}

                      {Array.isArray(
                        providerServices
                      ) &&
                        providerServices.length >
                          0 && (
                          <div className="mt-3 flex flex-wrap gap-2">

                            {providerServices
                              .slice(0, 3)
                              .map(
                                (
                                  service,
                                  index
                                ) => {

                                  const name =
                                    typeof service ===
                                    "string"
                                      ? service
                                      : service.name ||
                                        service.service_name ||
                                        "Service";

                                  return (
                                    <span
                                      key={
                                        service.id ||
                                        index
                                      }
                                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md"
                                    >
                                      {name}
                                    </span>
                                  );
                                }
                              )}

                          </div>
                        )}

                      {/* Buttons */}

                      <div className="mt-5 grid grid-cols-2 gap-2">

                        <button
                          onClick={() =>
                            handleViewProvider(
                              provider
                            )
                          }
                          className="border border-gray-300 text-gray-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          View Provider
                        </button>

                        <button
                          onClick={() =>
                            handleBookNow(
                              provider
                            )
                          }
                          className="bg-blue-600 text-white px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          Book Now
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

      {/* ================================================================
          BOOKING MODAL
      ================================================================ */}

      {showBookingModal &&
        selectedProvider && (
          <div
            className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
            onClick={closeBookingModal}
          >

            <div
              className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* ========================================================
                  MODAL HEADER
              ======================================================== */}

              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Book Service
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Enter your service details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBookingModal}
                  disabled={bookingLoading}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <X size={20} />
                </button>

              </div>

              {/* ========================================================
                  FORM
              ======================================================== */}

              <form
                onSubmit={handleCreateBooking}
                className="p-5"
              >

                {/* Selected Service */}

                <div className="mb-5">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selected Service
                  </label>

                  <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 flex items-center gap-3">

                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                      {React.createElement(
                        getServiceIcon(
                          selectedService
                        ),
                        {
                          size: 20,
                        }
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedService.name ||
                          selectedService.service_name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Service selected
                      </p>
                    </div>

                  </div>

                </div>

                {/* Selected Provider */}

                <div className="mb-5">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selected Provider
                  </label>

                  <div className="border border-gray-200 rounded-xl p-3 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">
                        {getProviderName(
                          selectedProvider
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="font-semibold text-gray-900">
                          {getProviderName(
                            selectedProvider
                          )}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-gray-500">

                          <span className="flex items-center gap-1 text-yellow-500">
                            <Star
                              size={12}
                              fill="currentColor"
                            />

                            {Number(
                              getProviderRating(
                                selectedProvider
                              )
                            ).toFixed(1)}
                          </span>

                          {getProviderDistance(
                            selectedProvider
                          ) !== null && (
                            <span>
                              •{" "}
                              {
                                getProviderDistance(
                                  selectedProvider
                                )
                              }{" "}
                              km away
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Address */}

                <div className="mb-5">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Address
                    <span className="text-red-500">
                      {" "}
                      *
                    </span>
                  </label>

                  <textarea
                    name="address"
                    value={
                      bookingForm.address
                    }
                    onChange={
                      handleBookingChange
                    }
                    rows={3}
                    maxLength={500}
                    placeholder="Enter the address where you need the service"
                    className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />

                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {bookingForm.address.length}/500
                  </p>

                </div>

                {/* Current Location */}

                <div className="mb-5">

                  <div className="border border-green-200 bg-green-50 rounded-xl p-3 flex items-center gap-3">

                    <MapPin
                      size={20}
                      className="text-green-600"
                    />

                    <div>

                      <p className="text-sm font-medium text-green-800">
                        Current Location Available
                      </p>

                      <p className="text-xs text-green-700">
                        Your GPS coordinates will be used for this booking.
                      </p>

                    </div>

                    <CheckCircle
                      size={20}
                      className="ml-auto text-green-600"
                    />

                  </div>

                </div>

                {/* Problem Description */}

                <div className="mb-5">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Problem Description
                  </label>

                  <textarea
                    name="problem_description"
                    value={
                      bookingForm.problem_description
                    }
                    onChange={
                      handleBookingChange
                    }
                    rows={4}
                    maxLength={1000}
                    placeholder="Describe your problem..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />

                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {
                      bookingForm
                        .problem_description
                        .length
                    }
                    /1000
                  </p>

                </div>

                {/* Request Type */}

                <div className="mb-5">

                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Request Type
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    {/* Instant */}

                    <label
                      className={`border rounded-xl p-3 cursor-pointer transition ${
                        bookingForm.request_type ===
                        "instant"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >

                      <div className="flex items-center gap-2">

                        <input
                          type="radio"
                          name="request_type"
                         value="now"
                          checked={
                            bookingForm.request_type ===
                            "now"
                          }
                          onChange={
                            handleBookingChange
                          }
                        />

                        <Clock
                          size={17}
                          className="text-blue-600"
                        />

                        <span className="text-sm font-medium">
                          Now
                        </span>

                      </div>

                      <p className="text-xs text-gray-500 mt-2 ml-6">
                        Request service now
                      </p>

                    </label>

                    {/* Scheduled */}

                    <label
                      className={`border rounded-xl p-3 cursor-pointer transition ${
                        bookingForm.request_type ===
                        "scheduled"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >

                      <div className="flex items-center gap-2">

                        <input
                          type="radio"
                          name="request_type"
                          value="scheduled"
                          checked={
                            bookingForm.request_type ===
                            "scheduled"
                          }
                          onChange={
                            handleBookingChange
                          }
                        />

                        <Calendar
                          size={17}
                          className="text-blue-600"
                        />

                        <span className="text-sm font-medium">
                          Schedule
                        </span>

                      </div>

                      <p className="text-xs text-gray-500 mt-2 ml-6">
                        Choose date & time
                      </p>

                    </label>

                  </div>

                </div>

                {/* Scheduled Date Time */}

                {bookingForm.request_type ===
                  "scheduled" && (
                  <div className="mb-5">

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Schedule Date & Time
                      <span className="text-red-500">
                        {" "}
                        *
                      </span>
                    </label>

                    <input
                      type="datetime-local"
                      name="scheduled_at"
                      value={
                        bookingForm.scheduled_at
                      }
                      onChange={
                        handleBookingChange
                      }
                      min={new Date()
                        .toISOString()
                        .slice(0, 16)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />

                  </div>
                )}

                {/* Error */}

                {bookingError && (
                  <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-start gap-3">

                    <AlertCircle
                      size={18}
                      className="mt-0.5 flex-shrink-0"
                    />

                    <p className="text-sm">
                      {bookingError}
                    </p>

                  </div>
                )}

                {/* Success */}

                {bookingSuccess && (
                  <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 flex items-center gap-3">

                    <CheckCircle
                      size={20}
                      className="flex-shrink-0"
                    />

                    <p className="text-sm font-medium">
                      {bookingSuccess}
                    </p>

                  </div>
                )}

                {/* Buttons */}

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={
                      closeBookingModal
                    }
                    disabled={
                      bookingLoading
                    }
                    className="border border-gray-300 text-gray-700 rounded-xl px-4 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      bookingLoading ||
                      !!bookingSuccess
                    }
                    className="bg-blue-600 text-white rounded-xl px-4 py-3 font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >

                    {bookingLoading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Creating...
                      </>
                    ) : (
                      "Create Booking"
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
};

export default CustomerDashboard;