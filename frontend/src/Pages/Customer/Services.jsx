import React, { useMemo, useState } from "react";
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
} from "lucide-react";

const Services = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Temporary frontend data.
  // Later this data will come from Laravel API.
  const services = [
    {
      id: 1,
      name: "Electrician",
      category: "Electrical",
      description:
        "Wiring, switches, sockets, lights and other electrical services.",
      providers: 24,
      icon: Zap,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      id: 2,
      name: "Fan Repair",
      category: "Repair",
      description:
        "Fan repair, installation, noise problems and maintenance services.",
      providers: 18,
      icon: Fan,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: 3,
      name: "Plumber",
      category: "Plumbing",
      description:
        "Tap, pipe, leakage, bathroom and other plumbing services.",
      providers: 21,
      icon: Droplets,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      id: 4,
      name: "AC Repair",
      category: "Appliance",
      description:
        "AC repair, servicing, installation and maintenance services.",
      providers: 16,
      icon: Wind,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      id: 5,
      name: "Carpenter",
      category: "Carpentry",
      description:
        "Furniture repair, installation, doors, shelves and woodwork.",
      providers: 14,
      icon: Hammer,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      id: 6,
      name: "Home Cleaning",
      category: "Cleaning",
      description:
        "Professional home, room, kitchen and bathroom cleaning services.",
      providers: 20,
      icon: Sparkles,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      id: 7,
      name: "Appliance Repair",
      category: "Appliance",
      description:
        "Repair and maintenance for common home electrical appliances.",
      providers: 12,
      icon: Refrigerator,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: 8,
      name: "General Repair",
      category: "Repair",
      description:
        "Reliable solutions for common household repair requirements.",
      providers: 17,
      icon: Wrench,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  const categories = [
    "All",
    "Electrical",
    "Repair",
    "Plumbing",
    "Appliance",
    "Carpentry",
    "Cleaning",
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "All" ||
        service.category === activeCategory;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        service.name.toLowerCase().includes(searchText) ||
        service.category.toLowerCase().includes(searchText) ||
        service.description.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const clearSearch = () => {
    setSearch("");
  };

  const handleViewService = (service) => {
    /*
      Later:
      navigate(`/customer/services/${service.id}`);

      This will open Service Details page.
    */
    console.log("Selected Service:", service);
  };

  return (
    <div className="min-h-full bg-gray-50/60">
      {/* ================= HEADER ================= */}
      <div className="border-b border-gray-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                <Wrench size={17} />
                <span>Quick Service Portal</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Find a Service
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Find trusted professionals for your home service needs.
              </p>
            </div>

            {/* Available Services */}
            <div className="hidden rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 sm:flex sm:items-center sm:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users size={19} />
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900">
                  {services.reduce(
                    (total, service) => total + service.providers,
                    0
                  )}
                  +
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
                onChange={(e) => setSearch(e.target.value)}
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
        {/* ================= CATEGORY FILTER ================= */}
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
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
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

        {/* ================= RESULT HEADER ================= */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Available Services
            </h2>

            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              {filteredServices.length} service
              {filteredServices.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* ================= SERVICE CARDS ================= */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredServices.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-gray-900/5"
                >
                  <div className="p-5">
                    {/* Icon + Category */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${service.iconBg}`}
                      >
                        <Icon
                          size={24}
                          strokeWidth={2}
                          className={service.iconColor}
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
                      {service.description}
                    </p>

                    {/* Providers */}
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Users size={14} />
                      </div>

                      <span>
                        <strong className="text-gray-800">
                          {service.providers}
                        </strong>{" "}
                        providers available
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-3">
                    <button
                      type="button"
                      onClick={() => handleViewService(service)}
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
            })}
          </div>
        ) : (
          /* ================= EMPTY STATE ================= */
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <Search size={28} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              No services found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              We couldn't find a service matching your search. Try another
              service name or choose a different category.
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
      </main>
    </div>
  );
};

export default Services;