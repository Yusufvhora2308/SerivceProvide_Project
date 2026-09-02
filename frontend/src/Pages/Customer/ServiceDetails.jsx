// PATH: src/Pages/Customer/ServiceDetails.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Wrench,
  Zap,
  Fan,
  Droplets,
  Wind,
  Hammer,
  Sparkles,
  Refrigerator,
  Users,
  MapPin,
  Star,
  IndianRupee,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  BriefcaseBusiness,
  Wifi,
} from "lucide-react";

import api from "../../api/axios";

const ServiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================================
  // SERVICE
  // ==========================================================

  const [service, setService] = useState(null);

  // ==========================================================
  // LOADING / ERROR
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // ICON MAPPING
  // ==========================================================

  const iconMap = {
    electrician: Zap,
    "fan repair": Fan,
    plumber: Droplets,
    "ac repair": Wind,
    carpenter: Hammer,
    "home cleaning": Sparkles,
    "appliance repair": Refrigerator,
    "general repair": Wrench,
  };

  const getServiceIcon = (name) => {
    if (!name) {
      return Wrench;
    }

    return iconMap[name.toLowerCase()] || Wrench;
  };

  // ==========================================================
  // ICON STYLE
  // ==========================================================

  const iconStyles = {
    electrician: {
      bg: "bg-yellow-50",
      color: "text-yellow-600",
    },

    "fan repair": {
      bg: "bg-blue-50",
      color: "text-blue-600",
    },

    plumber: {
      bg: "bg-cyan-50",
      color: "text-cyan-600",
    },

    "ac repair": {
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },

    carpenter: {
      bg: "bg-orange-50",
      color: "text-orange-600",
    },

    "home cleaning": {
      bg: "bg-purple-50",
      color: "text-purple-600",
    },

    "appliance repair": {
      bg: "bg-green-50",
      color: "text-green-600",
    },

    "general repair": {
      bg: "bg-rose-50",
      color: "text-rose-600",
    },
  };

  const getIconStyle = (name) => {
    const key = name?.toLowerCase();

    return (
      iconStyles[key] || {
        bg: "bg-gray-50",
        color: "text-gray-600",
      }
    );
  };

  // ==========================================================
  // GET SINGLE SERVICE
  // ==========================================================

  const fetchService = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching Service ID:", id);

      const response = await api.get(`/services/${id}`);

      console.log(
        "Service Details API Response:",
        response.data
      );

      if (response.data.success) {
        setService(response.data.service);
      } else {
        setService(null);

        setError(
          response.data.message ||
            "Unable to load service details."
        );
      }
    } catch (err) {
      console.error(
        "Service Details API Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load service details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FETCH ON PAGE LOAD
  // ==========================================================

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  // ==========================================================
  // REQUEST SERVICE
  // ==========================================================

  const handleRequestService = () => {
    navigate(
      `/customer/services/${id}/request`
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50/60">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={40}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading service details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !service) {
    return (
      <div className="min-h-full bg-gray-50/60">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() =>
              navigate("/customer/services")
            }
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />

            Back to Services
          </button>

          <div className="rounded-3xl border border-red-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Unable to load service
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {error ||
                "The requested service could not be found."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

              <button
                type="button"
                onClick={fetchService}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/customer/services")
                }
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Back to Services
              </button>

            </div>

          </div>
        </main>
      </div>
    );
  }

  // ==========================================================
  // SERVICE DATA
  // ==========================================================

  const Icon = getServiceIcon(service.name);

  const style = getIconStyle(service.name);

  const providers = service.providers || [];

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full bg-gray-50/60">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-gray-200/70 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() =>
              navigate("/customer/services")
            }
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />

            Back to Services
          </button>

        </div>

      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* ===================================================
            SERVICE HERO
        =================================================== */}

        <section className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">

          <div className="p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              {/* LEFT */}

              <div className="flex-1">

                <div className="flex items-start gap-4">

                  {/* ICON */}

                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${style.bg}`}
                  >
                    <Icon
                      size={32}
                      strokeWidth={2}
                      className={style.color}
                    />
                  </div>

                  {/* NAME */}

                  <div className="min-w-0">

                    <div className="mb-2 flex flex-wrap items-center gap-2">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                        {service.category ||
                          "Service"}
                      </span>

                      {service.is_active && (
                        <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-600">
                          <CheckCircle size={12} />
                          Active
                        </span>
                      )}

                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                      {service.name}
                    </h1>

                  </div>

                </div>

                {/* DESCRIPTION */}

                <p className="mt-6 max-w-3xl text-sm leading-7 text-gray-500 sm:text-base">
                  {service.description ||
                    "Professional service available near you. Book a trusted service provider for your home."}
                </p>

                {/* STATS */}

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">

                  {/* PRICE */}

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">

                    <div className="flex items-center gap-2 text-gray-400">
                      <IndianRupee size={16} />

                      <span className="text-xs font-medium">
                        Starting Price
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-bold text-gray-900">
                      ₹
                      {service.base_price
                        ? Number(
                            service.base_price
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "N/A"}
                    </p>

                  </div>

                  {/* PROVIDERS */}

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">

                    <div className="flex items-center gap-2 text-gray-400">
                      <Users size={16} />

                      <span className="text-xs font-medium">
                        Providers
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-bold text-gray-900">
                      {service.providers_count ||
                        0}
                    </p>

                  </div>

                  {/* LOCATION */}

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">

                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={16} />

                      <span className="text-xs font-medium">
                        Availability
                      </span>
                    </div>

                    <p className="mt-2 text-lg font-bold text-gray-900">
                      Nearby
                    </p>

                  </div>

                </div>

              </div>

              {/* RIGHT CTA */}

              <div className="w-full lg:max-w-xs">

                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Need this service?
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-gray-900">
                    Find a professional near you
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Select a provider and send your service request.
                  </p>

                  <button
                    type="button"
                    onClick={handleRequestService}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Request Service

                    <ArrowLeft
                      size={17}
                      className="rotate-180"
                    />
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            PROVIDERS + MAP
        =================================================== */}

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* =================================================
              AVAILABLE PROVIDERS
          ================================================= */}

          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Available Providers
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Professionals offering this service.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={19} />
              </div>

            </div>

            {/* PROVIDER LIST */}

            {providers.length > 0 ? (

              <div className="mt-6 space-y-4">

                {providers.map((provider) => {

                  const providerName =
                    provider.user?.name ||
                    "Service Provider";

                  const rating =
                    Number(
                      provider.rating || 0
                    ).toFixed(1);

                  const experience =
                    provider.pivot
                      ?.experience || 0;

                  const price =
                    provider.pivot?.price;

                  const serviceArea =
                    provider.pivot
                      ?.service_area ||
                    "Nearby";

                  const isOnline =
                    provider.is_online === true ||
                    provider.is_online === 1;

                  const profileImage =
                    provider.profile_image ||
                    provider.user?.profile_photo;

                  return (

                    <div
                      key={provider.id}
                      className="group rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-lg hover:shadow-gray-900/5 sm:p-5"
                    >

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                        {/* PROFILE */}

                        <div className="relative shrink-0">

                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-lg font-bold text-blue-600 ring-1 ring-blue-100">

                            {profileImage ? (

                              <img
                                src={profileImage}
                                alt={providerName}
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              providerName
                                .charAt(0)
                                .toUpperCase()

                            )}

                          </div>

                          {/* ONLINE DOT */}

                          <span
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                              isOnline
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />

                        </div>

                        {/* PROVIDER INFO */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-base font-bold text-gray-900">
                              {providerName}
                            </h3>

                            {isOnline ? (

                              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-600">
                                <Wifi size={11} />
                                Online
                              </span>

                            ) : (

                              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">
                                <Clock size={11} />
                                Offline
                              </span>

                            )}

                          </div>

                          {/* RATING / JOBS */}

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">

                            <span className="flex items-center gap-1 font-semibold text-gray-700">

                              <Star
                                size={14}
                                className="fill-yellow-400 text-yellow-400"
                              />

                              {rating}

                            </span>

                            <span className="flex items-center gap-1">
                              <BriefcaseBusiness size={14} />
                              {provider.total_jobs || 0} jobs
                            </span>

                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {experience}{" "}
                              {experience === 1
                                ? "year"
                                : "years"}{" "}
                              experience
                            </span>

                          </div>

                          {/* AREA */}

                          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">

                            <MapPin
                              size={14}
                              className="text-blue-500"
                            />

                            Service area:
                            <span className="text-gray-700">
                              {serviceArea}
                            </span>

                          </div>

                        </div>

                        {/* PRICE + BUTTON */}

                        <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">

                          <div className="text-left sm:text-right">

                            <p className="text-[11px] font-medium text-gray-400">
                              Service Price
                            </p>

                            <p className="mt-1 text-xl font-bold text-gray-900">
                              ₹
                              {price
                                ? Number(
                                    price
                                  ).toLocaleString(
                                    "en-IN"
                                  )
                                : "N/A"}
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/customer/services/${service.id}/request?provider_id=${provider.id}`
                              )
                            }
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                          >
                            Select Provider
                          </button>

                        </div>

                      </div>

                    </div>

                  );

                })}

              </div>

            ) : (

              /* NO PROVIDERS */

              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                  <Users size={25} />
                </div>

                <h3 className="mt-4 text-base font-bold text-gray-900">
                  No providers available
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  There are currently no verified providers offering this service.
                </p>

              </div>

            )}

          </div>

          {/* =================================================
              MAP
          ================================================= */}

          <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin size={19} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Nearby Providers
                </h2>

                <p className="text-xs text-gray-500">
                  Location-based matching
                </p>
              </div>

            </div>

            {/* MAP PLACEHOLDER */}

            <div className="mt-5 flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">

              <div className="px-5 text-center">

                <MapPin
                  size={35}
                  className="mx-auto text-gray-400"
                />

                <h3 className="mt-3 text-sm font-bold text-gray-700">
                  Live Map
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Map integration will be added next.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            SERVICE INFORMATION
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="text-lg font-bold text-gray-900">
            Service Information
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-2xl bg-gray-50 p-4">

              <p className="text-xs font-medium text-gray-400">
                Service Name
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {service.name}
              </p>

            </div>

            <div className="rounded-2xl bg-gray-50 p-4">

              <p className="text-xs font-medium text-gray-400">
                Category
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {service.category ||
                  "Not specified"}
              </p>

            </div>

            <div className="rounded-2xl bg-gray-50 p-4">

              <p className="text-xs font-medium text-gray-400">
                Base Price
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                ₹
                {service.base_price
                  ? Number(
                      service.base_price
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "N/A"}
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default ServiceDetails;