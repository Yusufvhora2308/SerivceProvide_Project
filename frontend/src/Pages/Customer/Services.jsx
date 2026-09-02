// PATH: src/Pages/Customer/Services.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Zap,
  Fan,
  Droplets,
  Wind,
  Hammer,
  Sparkles,
  Wrench,
  Refrigerator,
  ArrowRight,
  MapPin,
  Users,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api from "../../api/axios";

const Services = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Laravel API data
  const [services, setServices] = useState([]);

  // Loading / Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | ICON MAPPING
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | ICON COLORS
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | GET SERVICES FROM LARAVEL
  |--------------------------------------------------------------------------
  */

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/services");

      console.log("Services API Response:", response.data);

      /*
       * Expected Laravel response:
       *
       * {
       *   success: true,
       *   services: [...]
       * }
       */

      if (response.data.success) {
        setServices(response.data.services || []);
      } else {
        setServices([]);
        setError(
          response.data.message ||
            "Unable to load services."
        );
      }
    } catch (err) {
      console.error("Services API Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load services. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH ON PAGE LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchServices();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | GET CATEGORIES FROM API DATA
  |--------------------------------------------------------------------------
  */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [services]);

  /*
  |--------------------------------------------------------------------------
  | FILTER SERVICES
  |--------------------------------------------------------------------------
  */

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "All" ||
        service.category === activeCategory;

      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        service.name
          ?.toLowerCase()
          .includes(searchText) ||
        service.category
          ?.toLowerCase()
          .includes(searchText) ||
        service.description
          ?.toLowerCase()
          .includes(searchText);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [services, search, activeCategory]);

  /*
  |--------------------------------------------------------------------------
  | CLEAR SEARCH
  |--------------------------------------------------------------------------
  */

  const clearSearch = () => {
    setSearch("");
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW SERVICE
  |--------------------------------------------------------------------------
  */

  const handleViewService = (service) => {
    navigate(
      `/customer/services/${service.id}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | TOTAL PROVIDERS
  |--------------------------------------------------------------------------
  */

  const totalProviders = services.reduce(
    (total, service) =>
      total +
      Number(service.providers_count || 0),
    0
  );

  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

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
              Loading services...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-full bg-gray-50/60">

      {/* ================= HEADER ================= */}

      <div className="border-b border-gray-200/70 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">

                <Wrench size={17} />

                <span>
                  Quick Service Portal
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Find a Service
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Find trusted professionals for your home service needs.
              </p>

            </div>

            {/* Available Providers */}

            <div className="hidden rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 sm:flex sm:items-center sm:gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users size={19} />
              </div>

              <div>

                <p className="text-lg font-bold text-gray-900">
                  {totalProviders}+
                </p>

                <p className="text-xs font-medium text-gray-500">
                  Providers Available
                </p>

              </div>

            </div>

          </div>

          {/* ================= SEARCH ================= */}

          <div className="mt-6 max-w-3xl">

            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search for electrician, plumber, fan repair..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-12 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:h-14"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ================= MAIN CONTENT ================= */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div className="flex-1">

              <p className="text-sm font-semibold text-red-700">
                Unable to load services
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchServices}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* ================= CATEGORY FILTER ================= */}

        {!error && services.length > 0 && (
          <div className="mb-7">

            <div className="mb-3 flex items-center justify-between">

              <div>

                <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                  Service Categories
                </h2>

                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Choose a category to find the right professional.
                </p>

              </div>

              <div className="hidden items-center gap-2 text-xs font-medium text-gray-400 sm:flex">

                <SlidersHorizontal size={15} />

                Filter

              </div>

            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">

              {categories.map((category) => {

                const active =
                  activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setActiveCategory(category)
                    }
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {category}
                  </button>
                );

              })}

            </div>

          </div>
        )}

        {/* ================= RESULT HEADER ================= */}

        {!error && services.length > 0 && (
          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Available Services
              </h2>

              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                {filteredServices.length} service
                {filteredServices.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

          </div>
        )}

        {/* ================= SERVICE CARDS ================= */}

        {!error &&
          filteredServices.length > 0 && (

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {filteredServices.map(
                (service) => {

                  const Icon =
                    getServiceIcon(
                      service.name
                    );

                  const style =
                    getIconStyle(
                      service.name
                    );

                  return (
                    <div
                      key={service.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-gray-900/5"
                    >

                      <div className="p-5">

                        {/* Icon + Category */}

                        <div className="flex items-start justify-between">

                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.bg}`}
                          >

                            <Icon
                              size={24}
                              strokeWidth={2}
                              className={style.color}
                            />

                          </div>

                          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                            {service.category}
                          </span>

                        </div>

                        {/* Name */}

                        <h3 className="mt-5 text-base font-bold text-gray-900">
                          {service.name}
                        </h3>

                        {/* Description */}

                        <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                          {service.description ||
                            "Professional service available near you."}
                        </p>

                        {/* Price */}

                        <div className="mt-3">

                          <span className="text-sm font-semibold text-gray-900">
                            Starting from ₹
                            {service.base_price
                              ? Number(
                                  service.base_price
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "N/A"}
                          </span>

                        </div>

                        {/* Providers */}

                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                            <Users size={14} />

                          </div>

                          <span>

                            <strong className="text-gray-800">
                              {service.providers_count ||
                                0}
                            </strong>{" "}
                            providers available

                          </span>

                        </div>

                      </div>

                      {/* Card Footer */}

                      <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-3">

                        <button
                          type="button"
                          onClick={() =>
                            handleViewService(
                              service
                            )
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 ring-1 ring-gray-200 transition-all hover:bg-blue-600 hover:text-white hover:ring-blue-600 active:scale-[0.98]"
                        >

                          View Service

                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />

                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        {/* ================= NO SERVICES ================= */}

        {!error &&
          services.length === 0 && (

            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

                <Wrench size={28} />

              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No services available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                There are currently no active services available.
              </p>

              <button
                type="button"
                onClick={fetchServices}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Refresh
              </button>

            </div>
          )}

        {/* ================= NO SEARCH RESULTS ================= */}

        {!error &&
          services.length > 0 &&
          filteredServices.length === 0 && (

            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

                <Search size={28} />

              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No services found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                We couldn't find a service matching your search.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* ================= LOCATION INFO ================= */}

        {!error && (
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                <MapPin size={19} />

              </div>

              <div>

                <h3 className="text-sm font-bold text-gray-900">
                  Looking for nearby service providers?
                </h3>

                <p className="mt-0.5 text-xs leading-5 text-gray-500 sm:text-sm">
                  After selecting a service, you will be able to find available
                  providers near your location.
                </p>

              </div>

            </div>

            <span className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-600 shadow-sm">
              Map integration coming next
            </span>

          </div>
        )}

      </main>

    </div>
  );
};

export default Services;

