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
} from "lucide-react";

import api from "../../api/axios";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ==========================================
  // Dynamic Greeting
  // ==========================================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 17) {
      return "Good Afternoon";
    }

    return "Good Evening";
  };

  // ==========================================
  // Fetch Services
  // ==========================================

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);

      const response = await api.get("/services");

      setServices(response.data.data || []);
    } catch (error) {
      console.error(error);

      setError("Unable to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Service Icons
  // ==========================================

  const getServiceIcon = (service) => {
    const name = service.name?.toLowerCase() || "";
    const category = service.category?.toLowerCase() || "";

    if (name.includes("ac") || name.includes("air")) {
      return Wrench;
    }

    if (name.includes("electric") || category.includes("electrical")) {
      return Zap;
    }

    if (name.includes("plumb") || category.includes("plumb")) {
      return Droplets;
    }

    if (
      name.includes("laptop") ||
      name.includes("computer") ||
      category.includes("computer")
    ) {
      return Monitor;
    }

    if (
      name.includes("tv") ||
      name.includes("television") ||
      category.includes("electronics")
    ) {
      return Tv;
    }

    if (name.includes("clean") || category.includes("clean")) {
      return Sparkles;
    }

    if (name.includes("carpenter") || category.includes("home maintenance")) {
      return Hammer;
    }

    return MoreHorizontal;
  };

  // ==========================================
  // Search (Limited to 4 items)
  // ==========================================

  const filteredServices = useMemo(() => {
    let list = services;

    if (search.trim()) {
      const searchText = search.toLowerCase();
      list = list.filter((service) => {
        return (
          service.name?.toLowerCase().includes(searchText) ||
          service.category?.toLowerCase().includes(searchText)
        );
      });
    }

    return list.slice(0, 4);
  }, [services, search]);

  // ==========================================
  // Open Service
  // ==========================================

  const handleServiceClick = (serviceId) => {
    navigate(`/customer/services/${serviceId}/request`);
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] w-full overflow-x-hidden bg-slate-50/50 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        {/* =================================
            GREETING
        ================================= */}
        <section className="mb-4 sm:mb-5">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
            {getGreeting()}, {user?.name || "Customer"} 👋
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            What service do you need today?
          </p>
        </section>

        {/* =================================
            SEARCH
        ================================= */}
        <section className="mb-5 sm:mb-6">
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for AC repair, plumbing, electrician..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
            />
          </div>
        </section>

        {/* =================================
            POPULAR SERVICES HEADER
        ================================= */}
        <section className="w-full">
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-lg">
                Popular Services
              </h2>
              <p className="text-[11px] text-slate-500 sm:text-xs">
                Get professional help at your doorstep
              </p>
            </div>

            {/* Desktop View All */}
            <button
              type="button"
              onClick={() => navigate("/customer/services")}
              className="hidden items-center gap-1 text-xs font-semibold text-orange-600 transition hover:text-ornage-700 sm:flex"
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          {/* =================================
              LOADING SKELETON
          ================================= */}
          {loading && (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 w-full animate-pulse rounded-xl bg-slate-200/70"
                />
              ))}
            </div>
          )}

          {/* =================================
              ERROR
          ================================= */}
          {!loading && error && (
            <div className="w-full rounded-xl border border-red-100 bg-red-50 p-4 text-center sm:p-5">
              <p className="text-xs text-red-600 sm:text-sm">{error}</p>
              <button
                type="button"
                onClick={fetchServices}
                className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* =================================
              SERVICES GRID (4 Cards)
          ================================= */}
          {!loading && !error && filteredServices.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
              {filteredServices.map((service) => {
                const Icon = getServiceIcon(service);

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceClick(service.id)}
                    className="group flex min-h-[140px] w-full flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-xs transition duration-150 hover:border-black-200 hover:shadow-md active:scale-[0.98] sm:p-4"
                  >
                    {/* Icon */}
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white sm:h-10 sm:w-10">
                      <Icon
                        size={16}
                        className="sm:h-[18px] sm:w-[18px]"
                        strokeWidth={2}
                      />
                    </div>

                    {/* Content */}
                    <div className="w-full">
                      <h3 className="truncate text-xs font-semibold text-slate-900 group-hover:text-orange-600 sm:text-sm">
                        {service.name}
                      </h3>
                      <p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-[11px]">
                        {service.category}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mt-2 w-full border-t border-slate-100 pt-1.5 sm:pt-2">
                      <p className="text-[9px] text-slate-400 sm:text-[10px]">
                        Starting from
                      </p>
                      <p className="text-xs font-bold text-slate-900 sm:text-sm">
                        ₹{service.base_price}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* =================================
              NO SEARCH RESULTS
          ================================= */}
          {!loading && !error && filteredServices.length === 0 && (
            <div className="w-full rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center sm:p-8">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search size={18} />
              </div>
              <h3 className="mt-2.5 text-xs font-semibold text-slate-900 sm:text-sm">
                No services found
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Try searching for another service.
              </p>
            </div>
          )}
        </section>

        {/* Mobile View All Button */}
        <button
          type="button"
          onClick={() => navigate("/customer/services")}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs active:bg-slate-50 sm:hidden"
        >
          View All Services
          <ArrowRight size={14} />
        </button>
      </div>
    </main>
  );
};

export default CustomerDashboard;
