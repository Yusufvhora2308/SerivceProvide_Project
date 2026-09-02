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


// ==========================================
// LEAFLET DEFAULT MARKER FIX
// ==========================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


const CustomerDashboard = () => {

  const navigate = useNavigate();


  // ==========================================
  // SERVICES
  // ==========================================

  const [services, setServices] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ==========================================
  // SELECTED SERVICE
  // ==========================================

  const [selectedService, setSelectedService] =
    useState(null);


  // ==========================================
  // CUSTOMER LOCATION
  // ==========================================

  const [customerLocation, setCustomerLocation] =
    useState(null);


  // ==========================================
  // NEARBY PROVIDERS
  // ==========================================

  const [nearbyProviders, setNearbyProviders] =
    useState([]);

  const [loadingProviders, setLoadingProviders] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");


  // ==========================================
  // LIVE REFRESH STATUS
  // ==========================================

  const [lastProviderRefresh, setLastProviderRefresh] =
    useState(null);


  // ==========================================
  // USER
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );


  // ==========================================
  // GREETING
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
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    fetchServices();

    getCustomerLocation();

  }, []);


  // ==========================================
  // FETCH SERVICES
  // ==========================================

  const fetchServices = async () => {

    try {

      setLoading(true);

      setError("");

      const response =
        await api.get("/services");


      /*
      |--------------------------------------------------------------------------
      | Support both possible response formats
      |--------------------------------------------------------------------------
      |
      | response.data.data
      | OR
      | response.data.services
      |
      */

      const serviceList =
        response.data.data ||
        response.data.services ||
        [];


      setServices(serviceList);

    } catch (error) {

      console.error(
        "Services Error:",
        error
      );

      setError(
        "Unable to load services. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // GET CUSTOMER LOCATION
  // ==========================================

  const getCustomerLocation = () => {

    if (!navigator.geolocation) {

      setLocationError(
        "Geolocation is not supported by your browser."
      );

      return;
    }


    setLocationError("");


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        const location = {
          latitude,
          longitude,
        };


        setCustomerLocation(location);


        console.log(
          "Customer Location:",
          location
        );


        // Initial nearby providers

        getNearbyProviders(
          latitude,
          longitude,
          null
        );

      },


      (error) => {

        console.error(
          "Location Error:",
          error
        );


        setLocationError(
          "Unable to get your current location. Please allow location access."
        );

      },


      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }

    );

  };


  // ==========================================
  // GET NEARBY PROVIDERS
  // ==========================================

  const getNearbyProviders = async (
    latitude,
    longitude,
    serviceId = null
  ) => {

    try {

      setLoadingProviders(true);


      const params = {

        latitude: latitude,

        longitude: longitude,

        radius: 10,

      };


      // ----------------------------------------
      // SERVICE FILTER
      // ----------------------------------------

      if (serviceId) {

        params.service_id =
          serviceId;

      }


      console.log(
        "Nearby Provider Request:",
        params
      );


      const response =
        await api.get(
          "/customer/nearby-providers",
          {
            params,
          }
        );


      console.log(
        "Nearby Providers Response:",
        response.data
      );


      if (response.data.success) {

        setNearbyProviders(
          response.data.providers || []
        );


        setLastProviderRefresh(
          new Date()
        );

      } else {

        setNearbyProviders([]);

      }

    } catch (error) {

      console.error(
        "Nearby Providers Error:",
        error.response?.data || error
      );


      // Keep previous data during
      // temporary API failure.

    } finally {

      setLoadingProviders(false);

    }

  };


  // ==========================================
  // SELECT SERVICE
  // ==========================================
  //
  // Customer service card click karega
  //
  // Example:
  //
  // Electrician
  // service.id = 4
  //
  // Then:
  //
  // GET /customer/nearby-providers
  // ?latitude=...
  // &longitude=...
  // &radius=10
  // &service_id=4
  //
  // ==========================================

  const handleServiceClick = async (
    service
  ) => {

    console.log(
      "Selected Service:",
      service
    );


    setSelectedService(service);


    // Customer location available hai

    if (customerLocation) {

      await getNearbyProviders(

        customerLocation.latitude,

        customerLocation.longitude,

        service.id

      );

    } else {

      // Location nahi hai

      setLocationError(
        "Please allow location access to find nearby providers."
      );

    }


    // Scroll to provider section

    setTimeout(() => {

      const providerSection =
        document.getElementById(
          "nearby-providers-section"
        );


      if (providerSection) {

        providerSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }

    }, 100);

  };


  // ==========================================
  // CLEAR SELECTED SERVICE
  // ==========================================

  const clearSelectedService = () => {

    setSelectedService(null);


    if (customerLocation) {

      getNearbyProviders(

        customerLocation.latitude,

        customerLocation.longitude,

        null

      );

    }

  };


  // ==========================================
  // LIVE NEARBY PROVIDER REFRESH
  // ==========================================
  //
  // Selected service ke according
  // providers every 10 seconds refresh honge.
  //
  // ==========================================

  useEffect(() => {

    if (!customerLocation) {
      return;
    }


    console.log(
      "Starting live nearby provider refresh..."
    );


    // ----------------------------------------
    // First refresh
    // ----------------------------------------

    getNearbyProviders(

      customerLocation.latitude,

      customerLocation.longitude,

      selectedService?.id || null

    );


    // ----------------------------------------
    // Every 10 seconds
    // ----------------------------------------

    const providerInterval =
      setInterval(() => {

        console.log(
          "Refreshing nearby providers..."
        );


        getNearbyProviders(

          customerLocation.latitude,

          customerLocation.longitude,

          selectedService?.id || null

        );

      }, 10000);


    // ----------------------------------------
    // Cleanup
    // ----------------------------------------

    return () => {

      console.log(
        "Stopping nearby provider refresh."
      );


      clearInterval(
        providerInterval
      );

    };

  }, [
    customerLocation,
    selectedService?.id,
  ]);


  // ==========================================
  // SERVICE ICON
  // ==========================================

  const getServiceIcon = (service) => {

    const name =
      service.name?.toLowerCase() || "";

    const category =
      service.category?.toLowerCase() || "";


    if (
      name.includes("ac") ||
      name.includes("air")
    ) {
      return Wrench;
    }


    if (
      name.includes("electric") ||
      category.includes("electrical")
    ) {
      return Zap;
    }


    if (
      name.includes("plumb") ||
      category.includes("plumb")
    ) {
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


    if (
      name.includes("clean") ||
      category.includes("clean")
    ) {
      return Sparkles;
    }


    if (
      name.includes("carpenter") ||
      category.includes("home maintenance")
    ) {
      return Hammer;
    }


    return MoreHorizontal;

  };


  // ==========================================
  // FILTER SERVICES
  // ==========================================

  const filteredServices = useMemo(() => {

    let list = services;


    if (search.trim()) {

      const searchText =
        search.toLowerCase();


      list = list.filter((service) => {

        return (

          service.name
            ?.toLowerCase()
            .includes(searchText)

          ||

          service.category
            ?.toLowerCase()
            .includes(searchText)

        );

      });

    }


    return list.slice(0, 4);

  }, [services, search]);


  // ==========================================
  // BOOK NOW
  // ==========================================
  //
  // Abhi selected service request page par
  // navigate karega.
  //
  // Provider ID bhi query parameter mein
  // bhej rahe hain.
  //
  // ==========================================

  const handleBookNow = (
    provider
  ) => {

    if (!selectedService) {

      return;

    }


    navigate(
      `/customer/services/${selectedService.id}/request?provider_id=${provider.id}`
    );

  };


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <main className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] w-full overflow-x-hidden bg-slate-50/50 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8">

      <div className="mx-auto flex w-full max-w-7xl flex-col">


        {/* =================================
            GREETING
        ================================= */}

        <section className="mb-4 sm:mb-5">

          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">

            {getGreeting()},{" "}

            {user?.name || "Customer"} 👋

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
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search for AC repair, plumbing, electrician..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
            />

          </div>

        </section>


        {/* =================================
            POPULAR SERVICES
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
              onClick={() =>
                navigate(
                  "/customer/services"
                )
              }
              className="hidden items-center gap-1 text-xs font-semibold text-orange-600 transition hover:text-orange-700 sm:flex"
            >

              View All

              <ArrowRight size={14} />

            </button>

          </div>


          {/* =================================
              LOADING
          ================================= */}

          {loading && (

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">

              {[1, 2, 3, 4].map(
                (item) => (

                  <div
                    key={item}
                    className="h-32 w-full animate-pulse rounded-xl bg-slate-200/70"
                  />

                )
              )}

            </div>

          )}


          {/* =================================
              ERROR
          ================================= */}

          {!loading && error && (

            <div className="w-full rounded-xl border border-red-100 bg-red-50 p-4 text-center sm:p-5">

              <p className="text-xs text-red-600 sm:text-sm">
                {error}
              </p>


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
              SERVICES
          ================================= */}

          {!loading &&
            !error &&
            filteredServices.length > 0 && (

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">

                {filteredServices.map(
                  (service) => {

                    const Icon =
                      getServiceIcon(
                        service
                      );


                    const isSelected =
                      selectedService?.id ===
                      service.id;


                    return (

                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          handleServiceClick(
                            service
                          )
                        }
                        className={`group flex min-h-[140px] w-full flex-col justify-between rounded-xl border p-3 text-left shadow-xs transition duration-150 active:scale-[0.98] sm:p-4 ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-slate-200/80 bg-white hover:border-slate-200 hover:shadow-md"
                        }`}
                      >

                        <div
                          className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition sm:h-10 sm:w-10 ${
                            isSelected
                              ? "bg-orange-600 text-white"
                              : "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
                          }`}
                        >

                          <Icon
                            size={16}
                            className="sm:h-[18px] sm:w-[18px]"
                            strokeWidth={2}
                          />

                        </div>


                        <div className="w-full">

                          <h3
                            className={`truncate text-xs font-semibold sm:text-sm ${
                              isSelected
                                ? "text-orange-700"
                                : "text-slate-900 group-hover:text-orange-600"
                            }`}
                          >

                            {service.name}

                          </h3>


                          <p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-[11px]">

                            {service.category}

                          </p>

                        </div>


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

                  }
                )}

              </div>

            )}


          {/* =================================
              NO SERVICES
          ================================= */}

          {!loading &&
            !error &&
            filteredServices.length === 0 && (

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


        {/* ==========================================
            NEARBY PROVIDERS
        ========================================== */}

        <section
          id="nearby-providers-section"
          className="mt-6 w-full"
        >


          {/* ==========================================
              HEADER
          ========================================== */}

          <div className="mb-3.5 flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-sm font-bold text-slate-900 sm:text-lg">

                  {selectedService
                    ? `${selectedService.name} Providers`
                    : "Nearby Providers"}

                </h2>


                {selectedService && (

                  <button
                    type="button"
                    onClick={
                      clearSelectedService
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                    title="Clear service filter"
                  >

                    <X size={13} />

                  </button>

                )}

              </div>


              <p className="text-[11px] text-slate-500 sm:text-xs">

                {selectedService
                  ? `Available ${selectedService.name} professionals near you`
                  : "Professionals available near your location"}

              </p>

            </div>


            {/* LIVE STATUS */}

            {customerLocation &&
              !loadingProviders && (

                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>

                  <span className="text-[10px] font-semibold text-emerald-600">
                    Live
                  </span>

                </div>

              )}

          </div>


          {/* ==========================================
              SELECTED SERVICE INFO
          ========================================== */}

          {selectedService && (

            <div className="mb-3 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5">

              <div>

                <p className="text-[10px] font-medium text-orange-600">
                  Selected Service
                </p>

                <p className="text-xs font-bold text-orange-800">
                  {selectedService.name}
                </p>

              </div>


              <p className="text-xs font-bold text-orange-800">

                From ₹{selectedService.base_price}

              </p>

            </div>

          )}


          {/* ==========================================
              CUSTOMER LOCATION
          ========================================== */}

          {customerLocation && (

            <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">

              <p className="text-xs text-slate-500">
                Your Location
              </p>


              <p className="mt-1 text-xs font-semibold text-slate-800">

                {customerLocation.latitude.toFixed(6)}

                {", "}

                {customerLocation.longitude.toFixed(6)}

              </p>

            </div>

          )}


          {/* ==========================================
              LOCATION ERROR
          ========================================== */}

          {locationError && (

            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3">

              <p className="text-xs text-red-600">
                {locationError}
              </p>


              <button
                type="button"
                onClick={getCustomerLocation}
                className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>

            </div>

          )}


          {/* ==========================================
              PROVIDER LOADING
          ========================================== */}

          {loadingProviders && (

            <div className="rounded-xl border border-slate-200 bg-white p-4">

              <div className="flex items-center gap-2">

                <RefreshCw
                  size={14}
                  className="animate-spin text-blue-600"
                />

                <p className="text-xs text-slate-500">

                  {selectedService
                    ? `Finding nearby ${selectedService.name} providers...`
                    : "Finding nearby providers..."}

                </p>

              </div>

            </div>

          )}


          {/* ==========================================
              MAP
          ========================================== */}

          {customerLocation && !loadingProviders && (

            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">


              {/* Map Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                <div>

                  <h3 className="text-sm font-semibold text-slate-900">

                    {selectedService
                      ? `${selectedService.name} Providers Near You`
                      : "Providers Near You"}

                  </h3>


                  <p className="mt-0.5 text-[11px] text-slate-500">

                    {selectedService
                      ? `Available ${selectedService.name} professionals within 10 KM`
                      : "Available professionals within 10 KM"}

                  </p>

                </div>


                {/* Last refresh */}

                {lastProviderRefresh && (

                  <p className="text-[9px] text-slate-400">

                    Updated{" "}

                    {lastProviderRefresh.toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    )}

                  </p>

                )}

              </div>


              {/* Map */}

              <div className="h-[350px] w-full">

                <MapContainer
                  center={[
                    customerLocation.latitude,
                    customerLocation.longitude,
                  ]}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >

                  {/* OpenStreetMap */}

                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  {/* =================================
                      CUSTOMER MARKER
                  ================================= */}

                  <Marker
                    position={[
                      customerLocation.latitude,
                      customerLocation.longitude,
                    ]}
                  >

                    <Popup>

                      <div>

                        <strong>
                          Your Location
                        </strong>

                        <br />

                        You are here.

                      </div>

                    </Popup>

                  </Marker>


                  {/* =================================
                      10 KM RADIUS
                  ================================= */}

                  <Circle
                    center={[
                      customerLocation.latitude,
                      customerLocation.longitude,
                    ]}
                    radius={10000}
                    pathOptions={{
                      fillOpacity: 0.08,
                    }}
                  />


                  {/* =================================
                      PROVIDER MARKERS
                  ================================= */}

                  {nearbyProviders.map(
                    (provider) => (

                      <Marker
                        key={provider.id}
                        position={[
                          Number(provider.latitude),
                          Number(provider.longitude),
                        ]}
                      >

                        <Popup>

                          <div className="min-w-[190px]">

                            <h3 className="font-semibold text-slate-900">

                              {provider.name ||
                                "Provider"}

                            </h3>


                            <p className="mt-1 text-xs text-slate-500">

                              Distance:{" "}

                              <strong>
                                {provider.distance} KM
                              </strong>

                            </p>


                            <p className="text-xs text-slate-500">

                              Rating:{" "}
                              ⭐{" "}
                              {provider.rating}

                            </p>


                            <p className="text-xs font-semibold text-green-600">

                              Available

                            </p>


                            <button
                              type="button"
                              onClick={() =>
                                handleBookNow(
                                  provider
                                )
                              }
                              className="mt-3 w-full rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700"
                            >

                              Book Now

                            </button>

                          </div>

                        </Popup>

                      </Marker>

                    )
                  )}

                </MapContainer>

              </div>

            </div>

          )}


          {/* ==========================================
              PROVIDER CARDS
          ========================================== */}

          {!loadingProviders &&
            nearbyProviders.length > 0 && (

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                {nearbyProviders.map(
                  (provider) => (

                    <div
                      key={provider.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h3 className="text-sm font-semibold text-slate-900">

                            {provider.name ||
                              "Provider"}

                          </h3>


                          {selectedService && (

                            <p className="mt-0.5 text-[10px] text-orange-600">

                              {selectedService.name}

                            </p>

                          )}

                        </div>


                        <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-600">

                          Available

                        </span>

                      </div>


                      <div className="mt-3 space-y-1">

                        <p className="text-xs text-slate-500">

                          Distance:{" "}

                          <span className="font-semibold text-slate-700">

                            {provider.distance} KM

                          </span>

                        </p>


                        <p className="text-xs text-slate-500">

                          Rating:{" "}

                          <span className="font-semibold text-slate-700">

                            ⭐{" "}
                            {provider.rating}

                          </span>

                        </p>


                        <p className="text-xs text-slate-500">

                          Status:{" "}

                          <span className="font-semibold text-green-600">

                            {
                              provider.availability_status
                            }

                          </span>

                        </p>


                        {/* Provider Services */}

                        {provider.services &&
                          provider.services.length > 0 && (

                            <div className="pt-1">

                              <p className="mb-1 text-[10px] text-slate-400">

                                Services:

                              </p>


                              <div className="flex flex-wrap gap-1">

                                {provider.services
                                  .slice(0, 3)
                                  .map(
                                    (service) => (

                                      <span
                                        key={
                                          service.id
                                        }
                                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-600"
                                      >

                                        {
                                          service.name
                                        }

                                      </span>

                                    )
                                  )}

                              </div>

                            </div>

                          )}

                      </div>


                      {/* =================================
                          BOOK NOW
                      ================================= */}

                      {selectedService && (

                        <button
                          type="button"
                          onClick={() =>
                            handleBookNow(
                              provider
                            )
                          }
                          className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-700 active:scale-[0.98]"
                        >

                          Book Now

                        </button>

                      )}

                    </div>

                  )
                )}

              </div>

            )}


          {/* ==========================================
              NO PROVIDERS
          ========================================== */}

          {!loadingProviders &&
            customerLocation &&
            nearbyProviders.length === 0 &&
            !locationError && (

              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">

                  <Search
                    size={18}
                    className="text-slate-400"
                  />

                </div>


                <p className="mt-2 text-xs font-semibold text-slate-700">

                  {selectedService
                    ? `No nearby ${selectedService.name} providers found`
                    : "No nearby providers found"}

                </p>


                <p className="mt-1 text-[11px] text-slate-400">

                  {selectedService
                    ? `There are currently no available ${selectedService.name} providers within 10 KM.`
                    : "There are currently no available providers within 10 KM."}

                </p>

              </div>

            )}

        </section>


        {/* ==========================================
            MOBILE VIEW ALL
        ========================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/customer/services"
            )
          }
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

