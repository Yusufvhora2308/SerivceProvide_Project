// PATH: src/Pages/Customer/ServiceRequest.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  User,
  Star,
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Swal from "sweetalert2";

import api from "../../api/axios";
import LocationPicker from "../../components/Customer/LocationPicker";

const ServiceRequest = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  // --------------------------------------------------
  // SERVICE
  // --------------------------------------------------

  const [service, setService] = useState(null);

  // --------------------------------------------------
  // PROVIDERS
  // --------------------------------------------------

  const [providers, setProviders] = useState([]);

  const [selectedProvider, setSelectedProvider] =
    useState(null);

  const [loadingProviders, setLoadingProviders] =
    useState(false);

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const [formData, setFormData] = useState({
    address: "",
    latitude: "",
    longitude: "",
    problem_description: "",
    request_type: "now",
    scheduled_at: "",
  });

  // --------------------------------------------------
  // PAGE STATES
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH SERVICE
  // --------------------------------------------------

  useEffect(() => {
    if (!serviceId) {
      setError("Service ID is missing.");
      setLoading(false);
      return;
    }

    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/services/${serviceId}`
      );

      console.log(
        "Service Details API:",
        response.data
      );

      /*
       * Supports:
       *
       * {
       *   success: true,
       *   service: {...}
       * }
       *
       * OR
       *
       * {
       *   data: {...}
       * }
       */

      const serviceData =
        response.data?.service ||
        response.data?.data;

      if (!serviceData) {
        setError("Service not found.");
        setService(null);
        return;
      }

      setService(serviceData);
    } catch (err) {
      console.error(
        "Service Details Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load service."
      );

      setService(null);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // FETCH NEARBY PROVIDERS
  // --------------------------------------------------

  const fetchNearbyProviders = async (
    latitude,
    longitude
  ) => {
    if (!latitude || !longitude || !serviceId) {
      return;
    }

    try {
      setLoadingProviders(true);

      setError("");

      setSelectedProvider(null);

      /*
       * Current project nearby provider API:
       *
       * /customer/nearby-providers
       *
       * Params:
       * latitude
       * longitude
       * radius
       * service_id
       */

      const response = await api.get(
        "/customer/nearby-providers",
        {
          params: {
            latitude,
            longitude,
            radius: 10,
            service_id: serviceId,
          },
        }
      );

      console.log(
        "Nearby Providers API:",
        response.data
      );

      /*
       * Supports multiple possible response formats.
       */

      const providerData =
        response.data?.providers ||
        response.data?.data ||
        response.data?.nearby_providers ||
        [];

      if (Array.isArray(providerData)) {
        setProviders(providerData);
      } else {
        setProviders([]);
      }
    } catch (err) {
      console.error(
        "Nearby Providers Error:",
        err.response?.data || err.message
      );

      setProviders([]);

      setError(
        err.response?.data?.message ||
          "Unable to find nearby providers."
      );
    } finally {
      setLoadingProviders(false);
    }
  };

  // --------------------------------------------------
  // LOCATION CHANGE
  // --------------------------------------------------

  const handleLocationChange = ({
    latitude,
    longitude,
    address,
  }) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
      address: address || prev.address,
    }));

    /*
     * After GPS location is selected,
     * find nearby providers.
     */

    if (latitude && longitude) {
      fetchNearbyProviders(
        latitude,
        longitude
      );
    }
  };

  // --------------------------------------------------
  // SELECT PROVIDER
  // --------------------------------------------------

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
  };

  // --------------------------------------------------
  // GET PROVIDER ID
  // --------------------------------------------------

  const getProviderId = (provider) => {
    return (
      provider?.provider_id ||
      provider?.id ||
      provider?.provider?.id
    );
  };

  // --------------------------------------------------
  // GET PROVIDER NAME
  // --------------------------------------------------

  const getProviderName = (provider) => {
    return (
      provider?.name ||
      provider?.user?.name ||
      provider?.provider?.name ||
      provider?.provider?.user?.name ||
      "Service Provider"
    );
  };

  // --------------------------------------------------
  // GET PROVIDER PRICE
  // --------------------------------------------------

  const getProviderPrice = (provider) => {
    const price =
      provider?.price ??
      provider?.provider_service_price ??
      provider?.service_price ??
      provider?.provider_service?.price;

    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return null;
    }

    return Number(price);
  };

  // --------------------------------------------------
  // GET PROVIDER RATING
  // --------------------------------------------------

  const getProviderRating = (provider) => {
    const rating =
      provider?.rating ??
      provider?.average_rating ??
      provider?.provider?.rating;

    if (
      rating === null ||
      rating === undefined ||
      rating === ""
    ) {
      return null;
    }

    return Number(rating);
  };

  // --------------------------------------------------
  // GET PROVIDER DISTANCE
  // --------------------------------------------------

  const getProviderDistance = (provider) => {
    const distance =
      provider?.distance ??
      provider?.distance_km;

    if (
      distance === null ||
      distance === undefined ||
      distance === ""
    ) {
      return null;
    }

    return Number(distance);
  };

  // --------------------------------------------------
  // SUBMIT REQUEST
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -----------------------------------------------
    // LOCATION VALIDATION
    // -----------------------------------------------

    if (
      !formData.latitude ||
      !formData.longitude
    ) {
      await Swal.fire({
        title: "Location Required",
        text: "Please select your service location on the map.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    // -----------------------------------------------
    // ADDRESS VALIDATION
    // -----------------------------------------------

    if (!formData.address.trim()) {
      await Swal.fire({
        title: "Address Required",
        text: "Please enter your complete address.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    // -----------------------------------------------
    // PROVIDER VALIDATION
    // -----------------------------------------------

    if (!selectedProvider) {
      await Swal.fire({
        title: "Select Provider",
        text: "Please select a nearby service provider.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    const providerId =
      getProviderId(selectedProvider);

    if (!providerId) {
      await Swal.fire({
        title: "Provider Error",
        text: "Selected provider information is invalid.",
        icon: "error",
        confirmButtonText: "OK",
      });

      return;
    }

    // -----------------------------------------------
    // SCHEDULE VALIDATION
    // -----------------------------------------------

    if (
      formData.request_type === "scheduled" &&
      !formData.scheduled_at
    ) {
      await Swal.fire({
        title: "Schedule Required",
        text: "Please select date and time.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    try {
      setSubmitting(true);

      /*
       * Backend:
       *
       * POST /api/customer/service-requests
       */

      const payload = {
        service_id: Number(serviceId),

        provider_id: Number(providerId),

        address: formData.address,

        latitude: Number(formData.latitude),

        longitude: Number(formData.longitude),

        problem_description:
          formData.problem_description.trim() ||
          null,

        request_type:
          formData.request_type,

        scheduled_at:
          formData.request_type === "scheduled"
            ? formData.scheduled_at
            : null,
      };

      console.log(
        "Creating Service Request:",
        payload
      );

      const response = await api.post(
        "/customer/service-requests",
        payload
      );

      console.log(
        "Create Service Request API:",
        response.data
      );

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      await Swal.fire({
        title: "Request Created Successfully!",
        text: "Your service request has been sent to the provider.",
        icon: "success",
        confirmButtonText: "View My Requests",
        confirmButtonColor: "#2563eb",
      });

      navigate("/customer/requests");
    } catch (err) {
      console.error(
        "Create Service Request Error:",
        err.response?.data || err.message
      );

      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors) {
        const messages = Object.values(
          validationErrors
        )
          .flat()
          .join(" ");

        setError(messages);

        await Swal.fire({
          title: "Validation Error",
          text: messages,
          icon: "warning",
          confirmButtonText: "OK",
        });
      } else {
        const message =
          err.response?.data?.message ||
          "Unable to create service request.";

        setError(message);

        await Swal.fire({
          title: "Request Failed",
          text: message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // LOADING PAGE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50">

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">

          <Loader2
            className="h-4 w-4 animate-spin text-blue-600"
          />

          Loading service details...

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // SERVICE NOT FOUND
  // --------------------------------------------------

  if (!service) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 p-4">

        <AlertCircle
          className="h-10 w-10 text-red-400"
        />

        <p className="mt-3 text-xs font-medium text-red-500 sm:text-sm">

          {error || "Service not found."}

        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          Go Back
        </button>

      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="relative min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-slate-50/50 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8">

      <div className="mx-auto flex w-full max-w-7xl flex-col">

        {/* ==================================================
            TOP BAR
        ================================================== */}

        <div className="mb-4 flex items-center justify-between">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 sm:text-sm"
          >

            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />

            Back

          </button>

          <div className="hidden items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 sm:flex">

            <ShieldCheck className="h-3.5 w-3.5" />

            Verified & Protected Booking

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full"
        >

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">

            {/* ==================================================
                LEFT SIDE
            ================================================== */}

            <div className="order-2 space-y-4 lg:order-1 lg:col-span-7">

              {/* SERVICE SUMMARY */}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600">

                      <Sparkles className="h-3 w-3" />

                      Service Request

                    </span>

                    <h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">

                      {service.name}

                    </h1>

                    <p className="mt-0.5 text-xs text-slate-400">

                      {service.category ||
                        "Home Care & Maintenance"}

                    </p>

                  </div>

                  <div className="text-right">

                    <span className="block text-[10px] font-medium uppercase text-slate-400">

                      Starting at

                    </span>

                    <span className="text-base font-bold text-slate-900 sm:text-lg">

                      ₹
                      {Number(
                        service.base_price || 0
                      ).toLocaleString("en-IN")}

                    </span>

                  </div>

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-medium text-red-600">

                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{error}</span>

                </div>
              )}

              {/* ==================================================
                  PROVIDERS
              ================================================== */}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <div className="flex items-center gap-1.5">

                      <UsersIcon />

                      <h2 className="text-xs font-bold text-slate-800 sm:text-sm">

                        Nearby Service Providers

                      </h2>

                    </div>

                    <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">

                      Select a provider for your service request.

                    </p>

                  </div>

                  {providers.length > 0 && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">

                      {providers.length} available

                    </span>
                  )}

                </div>

                {/* Loading Providers */}

                {loadingProviders && (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8">

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />

                      Finding nearby providers...

                    </div>

                  </div>
                )}

                {/* No Location */}

                {!loadingProviders &&
                  !formData.latitude &&
                  !formData.longitude && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                      <Navigation className="mx-auto h-7 w-7 text-slate-300" />

                      <p className="mt-2 text-xs font-semibold text-slate-600">

                        Select your location first

                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">

                        Nearby providers will appear automatically.

                      </p>

                    </div>
                  )}

                {/* No Providers */}

                {!loadingProviders &&
                  formData.latitude &&
                  formData.longitude &&
                  providers.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                      <User className="mx-auto h-7 w-7 text-slate-300" />

                      <p className="mt-2 text-xs font-semibold text-slate-600">

                        No nearby providers found

                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">

                        Try selecting another location or try again later.

                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          fetchNearbyProviders(
                            formData.latitude,
                            formData.longitude
                          )
                        }
                        className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-semibold text-white hover:bg-blue-700"
                      >
                        Search Again
                      </button>

                    </div>
                  )}

                {/* Provider Cards */}

                {!loadingProviders &&
                  providers.length > 0 && (
                    <div className="space-y-2.5">

                      {providers.map(
                        (provider, index) => {

                          const providerId =
                            getProviderId(
                              provider
                            );

                          const providerName =
                            getProviderName(
                              provider
                            );

                          const price =
                            getProviderPrice(
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

                          const isSelected =
                            getProviderId(
                              selectedProvider
                            ) ===
                            providerId;

                          return (
                            <button
                              type="button"
                              key={
                                providerId ||
                                index
                              }
                              onClick={() =>
                                handleSelectProvider(
                                  provider
                                )
                              }
                              className={`w-full rounded-xl border p-3 text-left transition-all sm:p-4 ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                              }`}
                            >

                              <div className="flex items-center gap-3">

                                {/* Avatar */}

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">

                                  <User size={18} />

                                </div>

                                {/* Details */}

                                <div className="min-w-0 flex-1">

                                  <div className="flex items-center gap-2">

                                    <h3 className="truncate text-xs font-bold text-slate-900 sm:text-sm">

                                      {providerName}

                                    </h3>

                                    {isSelected && (
                                      <CheckCircle2
                                        size={16}
                                        className="shrink-0 text-blue-600"
                                      />
                                    )}

                                  </div>

                                  <div className="mt-1 flex flex-wrap items-center gap-2">

                                    {rating !== null && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">

                                        <Star
                                          size={11}
                                          className="fill-yellow-400 text-yellow-400"
                                        />

                                        {rating.toFixed(
                                          1
                                        )}

                                      </span>
                                    )}

                                    {distance !==
                                      null && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">

                                        <MapPin
                                          size={11}
                                        />

                                        {distance.toFixed(
                                          1
                                        )}{" "}
                                        km

                                      </span>
                                    )}

                                  </div>

                                </div>

                                {/* Price */}

                                <div className="shrink-0 text-right">

                                  {price !==
                                  null ? (
                                    <>
                                      <p className="text-[9px] text-slate-400">

                                        Visit Price

                                      </p>

                                      <p className="text-sm font-bold text-slate-900">

                                        ₹
                                        {price.toLocaleString(
                                          "en-IN"
                                        )}

                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-[10px] font-semibold text-slate-400">

                                      Price on request

                                    </p>
                                  )}

                                </div>

                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>
                  )}

              </div>

              {/* ==================================================
                  ADDRESS
              ================================================== */}

              <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">

                  <MapPin className="h-4 w-4 text-blue-600" />

                  Complete Address

                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Flat No., Landmark, Street Name..."
                  rows="3"
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                />

              </div>

              {/* ==================================================
                  PROBLEM
              ================================================== */}

              <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">

                  <FileText className="h-4 w-4 text-blue-600" />

                  Describe Problem / Requirements

                </label>

                <textarea
                  name="problem_description"
                  value={
                    formData.problem_description
                  }
                  onChange={handleChange}
                  placeholder="E.g., AC is making rattling noise and cooling is weak..."
                  rows="3"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                />

              </div>

              {/* ==================================================
                  TIMING
              ================================================== */}

              <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">

                  <Clock className="h-4 w-4 text-blue-600" />

                  When do you need the service?

                </label>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

                  {/* NOW */}

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      formData.request_type ===
                      "now"
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >

                    <div className="flex items-center gap-2">

                      <Zap
                        className={`h-4 w-4 ${
                          formData.request_type ===
                          "now"
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      />

                      <div>

                        <span className="block text-xs font-semibold sm:text-sm">

                          Immediate

                        </span>

                        <span className="block text-[10px] text-slate-400">

                          Available expert

                        </span>

                      </div>

                    </div>

                    <input
                      type="radio"
                      name="request_type"
                      value="now"
                      checked={
                        formData.request_type ===
                        "now"
                      }
                      onChange={handleChange}
                      className="hidden"
                    />

                  </label>

                  {/* SCHEDULE */}

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      formData.request_type ===
                      "scheduled"
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >

                    <div className="flex items-center gap-2">

                      <Calendar
                        className={`h-4 w-4 ${
                          formData.request_type ===
                          "scheduled"
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      />

                      <div>

                        <span className="block text-xs font-semibold sm:text-sm">

                          Schedule

                        </span>

                        <span className="block text-[10px] text-slate-400">

                          Pick date & time

                        </span>

                      </div>

                    </div>

                    <input
                      type="radio"
                      name="request_type"
                      value="scheduled"
                      checked={
                        formData.request_type ===
                        "scheduled"
                      }
                      onChange={handleChange}
                      className="hidden"
                    />

                  </label>

                </div>

                {formData.request_type ===
                  "scheduled" && (
                  <div className="pt-2">

                    <input
                      type="datetime-local"
                      name="scheduled_at"
                      value={
                        formData.scheduled_at
                      }
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                    />

                  </div>
                )}

              </div>

              {/* ==================================================
                  SUBMIT
              ================================================== */}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingProviders
                  }
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:text-sm"
                >

                  {submitting ? (
                    <div className="flex items-center gap-2">

                      <Loader2 className="h-4 w-4 animate-spin" />

                      Creating Request...

                    </div>
                  ) : (
                    <>
                      Confirm & Request Service
                    </>
                  )}

                </button>

                <p className="mt-2 text-center text-[10px] text-slate-400">

                  No advance payment required. Pay after service completion.

                </p>

              </div>

            </div>

            {/* ==================================================
                RIGHT SIDE LOCATION
            ================================================== */}

            <div className="order-1 space-y-4 lg:sticky lg:top-24 lg:order-2 lg:col-span-5">

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <div className="mb-3 flex items-center justify-between">

                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">

                    <MapPin className="h-4 w-4 text-blue-600" />

                    Pin Exact Location

                  </span>

                  <span className="text-[10px] font-medium text-slate-400">

                    GPS Accurate

                  </span>

                </div>

                <div className="min-h-[220px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:min-h-[280px]">

                  <LocationPicker
                    latitude={
                      formData.latitude
                    }
                    longitude={
                      formData.longitude
                    }
                    onLocationChange={
                      handleLocationChange
                    }
                  />

                </div>

                {/* Coordinates */}

                {formData.latitude &&
                  formData.longitude && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3">

                      <div className="flex items-center gap-2">

                        <CheckCircle2
                          size={15}
                          className="text-green-600"
                        />

                        <span className="text-[10px] font-semibold text-slate-600">

                          Location selected

                        </span>

                      </div>

                      <p className="mt-1 text-[9px] text-slate-400">

                        Lat:{" "}
                        {formData.latitude}

                        {" • "}

                        Lng:{" "}
                        {formData.longitude}

                      </p>

                    </div>
                  )}

              </div>

              {/* SELECTED PROVIDER */}

              {selectedProvider && (
                <div className="rounded-2xl border border-green-200 bg-green-50/70 p-4">

                  <div className="flex items-center gap-2">

                    <CheckCircle2
                      size={18}
                      className="text-green-600"
                    />

                    <div>

                      <p className="text-xs font-bold text-green-800">

                        Provider Selected

                      </p>

                      <p className="text-xs text-green-700">

                        {getProviderName(
                          selectedProvider
                        )}

                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

        </form>

      </div>

    </main>
  );
};

// --------------------------------------------------
// SMALL ICON COMPONENT
// --------------------------------------------------

const UsersIcon = () => {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

      <User size={14} />

    </div>
  );
};

export default ServiceRequest;

