import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Wrench,
  Zap,
  Droplets,
  Monitor,
  Tv,
  Sparkles,
  Hammer,
} from "lucide-react";

import api from "../../api/axios";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | User
  |--------------------------------------------------------------------------
  */

  const user = JSON.parse(localStorage.getItem("user")) || {};

  /*
  |--------------------------------------------------------------------------
  | Services
  |--------------------------------------------------------------------------
  */

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");

  const [loadingServices, setLoadingServices] =
    useState(true);

  const [serviceError, setServiceError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Greeting
  |--------------------------------------------------------------------------
  */

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

      setServices(
        Array.isArray(serviceData)
          ? serviceData
          : []
      );
    } catch (error) {
      console.error(
        "Fetch Services Error:",
        error
      );

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
  | Load Services
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchServices();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Filter Services
  |--------------------------------------------------------------------------
  |
  | Dashboard shows maximum 4 services.
  |
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

    const matchedKey = Object.keys(
      serviceIcons
    ).find((key) =>
      name.includes(key)
    );

    return matchedKey
      ? serviceIcons[matchedKey]
      : Wrench;
  };

  /*
  |--------------------------------------------------------------------------
  | Service Click
  |--------------------------------------------------------------------------
  |
  | Open Service Request form with selected service ID.
  |
  */

  const handleServiceClick = (service) => {
    navigate(
      `/customer/services/${service.id}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | View All Services
  |--------------------------------------------------------------------------
  */

  const handleViewAllServices = () => {
    navigate("/customer/services");
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

            {/* ----------------------------------------------------------
                Greeting
            ---------------------------------------------------------- */}

            <div>

              <p className="text-sm text-gray-500 mb-1">
                {greeting}
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                Hello, {user?.name || "Customer"} 👋
              </h1>

              <p className="text-gray-500 mt-2">
                Find the service you need.
              </p>

            </div>

            {/* ----------------------------------------------------------
                Search
            ---------------------------------------------------------- */}

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

          {/* ------------------------------------------------------------
              Section Header
          ------------------------------------------------------------ */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                What service do you need?
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Select a service to request a service provider.
              </p>

            </div>

            {/* ----------------------------------------------------------
                View All Services
            ---------------------------------------------------------- */}

            <button
              type="button"
              onClick={handleViewAllServices}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
            >
              View All Services →
            </button>

          </div>

          {/* ------------------------------------------------------------
              Error
          ------------------------------------------------------------ */}

          {serviceError && (

            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">

              {serviceError}

            </div>

          )}

          {/* ------------------------------------------------------------
              Loading
          ------------------------------------------------------------ */}

          {loadingServices ? (

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {[1, 2, 3, 4].map((item) => (

                <div
                  key={item}
                  className="h-32 bg-gray-200 rounded-2xl animate-pulse"
                />

              ))}

            </div>

          ) : filteredServices.length === 0 ? (

            /* ----------------------------------------------------------
                No Services
            ---------------------------------------------------------- */

            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

              <Wrench
                size={40}
                className="mx-auto text-gray-300 mb-3"
              />

              <h3 className="font-semibold text-gray-900">
                No services found
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Try searching for another service.
              </p>

            </div>

          ) : (

            /* ----------------------------------------------------------
                Services
            ---------------------------------------------------------- */

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {filteredServices.map((service) => {

                const Icon =
                  getServiceIcon(service);

                return (

                  <button
                    key={service.id}
                    type="button"
                    onClick={() =>
                      handleServiceClick(service)
                    }
                    className="text-left bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                  >

                    {/* Service Icon */}

                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">

                      <Icon size={24} />

                    </div>

                    {/* Service Name */}

                    <h3 className="font-semibold text-gray-900">

                      {service.name ||
                        service.service_name ||
                        "Service"}

                    </h3>

                    {/* Description */}

                    <p className="text-sm text-gray-500 mt-1">
                      Request this service
                    </p>

                  </button>

                );

              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default CustomerDashboard;
