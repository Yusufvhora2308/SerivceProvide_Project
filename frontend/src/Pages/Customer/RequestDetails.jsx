import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Wrench,
  XCircle,
  CheckCircle,
  Navigation,
  RefreshCw,
  Bike,
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
| FIX LEAFLET DEFAULT MARKER ICON
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
| PROFESSIONAL PROVIDER BIKE ICON
|--------------------------------------------------------------------------
|
| Custom Leaflet marker using SVG.
| No extra package required.
|
*/

const providerVehicleIcon = L.divIcon({
  className: "provider-vehicle-marker",

  html: `
    <div
      style="
        width: 46px;
        height: 46px;
        background: #2563eb;
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.30);
      "
    >
      <div
        style="
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="27"
          height="27"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="5.5" cy="17.5" r="3.5"></circle>
          <circle cx="18.5" cy="17.5" r="3.5"></circle>
          <path d="M5.5 17.5 8 9h5l5.5 8.5"></path>
          <path d="M8 9h5l2.5 3.5h-6"></path>
          <path d="M13 9V6.5"></path>
          <path d="M11.5 6.5h3"></path>
        </svg>
      </div>
    </div>
  `,

  iconSize: [46, 46],
  iconAnchor: [23, 23],
  popupAnchor: [0, -25],
});


/*
|--------------------------------------------------------------------------
| HAVERSINE DISTANCE
|--------------------------------------------------------------------------
|
| Calculates distance between customer and provider.
| Result is returned in kilometers.
|
*/

const calculateDistance = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  const earthRadius = 6371;

  const lat1 = Number(latitude1);
  const lon1 = Number(longitude1);
  const lat2 = Number(latitude2);
  const lon2 = Number(longitude2);

  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return null;
  }

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
};


/*
|--------------------------------------------------------------------------
| FORMAT DISTANCE
|--------------------------------------------------------------------------
*/

const formatDistance = (distance) => {
  if (distance === null) {
    return "Distance unavailable";
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
};


/*
|--------------------------------------------------------------------------
| SMOOTH MOVING PROVIDER MARKER
|--------------------------------------------------------------------------
*/

function MovingProviderMarker({
  position,
  distance,
  lastUpdated,
}) {
  const markerRef = useRef(null);

  const animationFrameRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | FIRST MARKER POSITION
  |--------------------------------------------------------------------------
  */

  const initialPositionRef =
    useRef([
      Number(position.latitude),
      Number(position.longitude),
    ]);


  /*
  |--------------------------------------------------------------------------
  | ANIMATE PROVIDER MARKER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !markerRef.current ||
      !position
    ) {
      return;
    }

    const marker =
      markerRef.current;

    /*
    |--------------------------------------------------------------------------
    | CANCEL PREVIOUS ANIMATION
    |--------------------------------------------------------------------------
    */

    if (
      animationFrameRef.current
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );
    }


    const currentPosition =
      marker.getLatLng();

    const newPosition =
      L.latLng(
        Number(position.latitude),
        Number(position.longitude)
      );


    /*
    |--------------------------------------------------------------------------
    | CHECK LOCATION CHANGE
    |--------------------------------------------------------------------------
    */

    if (
      currentPosition.lat ===
        newPosition.lat &&
      currentPosition.lng ===
        newPosition.lng
    ) {
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | START POSITION
    |--------------------------------------------------------------------------
    */

    const startLat =
      currentPosition.lat;

    const startLng =
      currentPosition.lng;


    /*
    |--------------------------------------------------------------------------
    | END POSITION
    |--------------------------------------------------------------------------
    */

    const endLat =
      newPosition.lat;

    const endLng =
      newPosition.lng;


    /*
    |--------------------------------------------------------------------------
    | ANIMATION DURATION
    |--------------------------------------------------------------------------
    */

    const duration = 1000;

    const startTime =
      performance.now();


    /*
    |--------------------------------------------------------------------------
    | ANIMATION FUNCTION
    |--------------------------------------------------------------------------
    */

    const animateMarker = (
      currentTime
    ) => {
      const elapsed =
        currentTime - startTime;

      const progress =
        Math.min(
          elapsed / duration,
          1
        );


      const lat =
        startLat +
        (endLat - startLat) *
          progress;

      const lng =
        startLng +
        (endLng - startLng) *
          progress;


      marker.setLatLng([
        lat,
        lng,
      ]);


      if (progress < 1) {
        animationFrameRef.current =
          requestAnimationFrame(
            animateMarker
          );
      } else {
        marker.setLatLng([
          endLat,
          endLng,
        ]);

        animationFrameRef.current =
          null;
      }
    };


    animationFrameRef.current =
      requestAnimationFrame(
        animateMarker
      );


    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {
      if (
        animationFrameRef.current
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }
    };

  }, [position]);


  /*
  |--------------------------------------------------------------------------
  | PROVIDER MARKER
  |--------------------------------------------------------------------------
  */

  return (
    <Marker
      ref={markerRef}
      position={
        initialPositionRef.current
      }
      icon={providerVehicleIcon}
    >

      <Popup>

        <div className="min-w-[190px]">


          {/* POPUP HEADER */}

          <div className="flex items-center gap-2 mb-3">

            <Bike
              size={21}
              className="text-blue-600"
            />

            <strong className="text-gray-800">
              Provider Location
            </strong>

          </div>


          {/* ONLINE STATUS */}

          <p className="text-sm text-gray-600">

            {position.is_online
              ? "🟢 Provider is online"
              : "⚪ Provider is offline"}

          </p>


          {/* DISTANCE */}

          {distance !== null && (
            <p className="text-sm text-blue-600 font-semibold mt-2">

              Provider is{" "}
              {formatDistance(distance)}{" "}
              away

            </p>
          )}


          {/* LAST UPDATED */}

          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-2">

              Last updated:{" "}
              {lastUpdated.toLocaleTimeString()}

            </p>
          )}


          <p className="text-xs text-gray-400 mt-2">
            Live location
          </p>

        </div>

      </Popup>

    </Marker>
  );
}


/*
|--------------------------------------------------------------------------
| STATUS CONFIG
|--------------------------------------------------------------------------
*/

const statusConfig = {
  searching: {
    label: "Searching Provider",
    className:
      "bg-yellow-100 text-yellow-700",
  },

  provider_assigned: {
    label: "Provider Assigned",
    className:
      "bg-blue-100 text-blue-700",
  },

  provider_on_the_way: {
    label: "Provider On The Way",
    className:
      "bg-purple-100 text-purple-700",
  },

  arrived: {
    label: "Provider Arrived",
    className:
      "bg-indigo-100 text-indigo-700",
  },

  service_started: {
    label: "Service Started",
    className:
      "bg-orange-100 text-orange-700",
  },

  service_completed: {
    label: "Service Completed",
    className:
      "bg-green-100 text-green-700",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-700",
  },
};


/*
|--------------------------------------------------------------------------
| FORMAT STATUS
|--------------------------------------------------------------------------
*/

const formatStatus = (status) => {
  return (
    statusConfig[status] || {
      label: status
        ? status
            .replaceAll("_", " ")
            .replace(
              /\b\w/g,
              (letter) =>
                letter.toUpperCase()
            )
        : "Unknown",

      className:
        "bg-gray-100 text-gray-700",
    }
  );
};


/*
|--------------------------------------------------------------------------
| REQUEST DETAILS
|--------------------------------------------------------------------------
*/

export default function RequestDetails() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();


  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [request, setRequest] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [providerLocation, setProviderLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);


  /*
  |--------------------------------------------------------------------------
  | FETCH REQUEST
  |--------------------------------------------------------------------------
  */

  const fetchRequest = async () => {

    try {

      setError("");

      const response =
        await api.get(
          `/customer/service-requests/${id}`
        );


      if (
        response.data.success
      ) {

        setRequest(
          response.data
            .service_request
        );

      }

    } catch (err) {

      console.error(
        "Request details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load request details."
      );

    } finally {

      setLoading(false);

    }
  };


  /*
  |--------------------------------------------------------------------------
  | FETCH PROVIDER LOCATION
  |--------------------------------------------------------------------------
  */

  const fetchProviderLocation =
    async () => {

      if (!id) {
        return;
      }


      try {

        setLocationLoading(
          true
        );

        setLocationError("");


        const response =
          await api.get(
            `/customer/service-requests/${id}/provider-location`
          );


        if (
          response.data.success
        ) {

          const location =
            response.data
              .provider_location ||
            null;


          setProviderLocation(
            location
          );


          /*
          |--------------------------------------------------------------------------
          | SAVE LAST UPDATED TIME
          |--------------------------------------------------------------------------
          */

          if (location) {

            setLastUpdated(
              new Date()
            );

          }

        }

      } catch (err) {

        console.error(
          "Provider location error:",
          err
        );

        setLocationError(
          err.response?.data?.message ||
            "Unable to load provider location."
        );

      } finally {

        setLocationLoading(
          false
        );

      }
    };


  /*
  |--------------------------------------------------------------------------
  | INITIAL REQUEST LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    fetchRequest();

  }, [id]);


  /*
  |--------------------------------------------------------------------------
  | LIVE PROVIDER LOCATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!request) {
      return;
    }


    const activeStatuses = [
      "provider_assigned",
      "provider_on_the_way",
      "arrived",
      "service_started",
    ];


    /*
    |--------------------------------------------------------------------------
    | STOP TRACKING
    |--------------------------------------------------------------------------
    */

    if (
      !activeStatuses.includes(
        request.status
      )
    ) {

      setProviderLocation(
        null
      );

      setLastUpdated(
        null
      );

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | FIRST LOCATION FETCH
    |--------------------------------------------------------------------------
    */

    fetchProviderLocation();


    /*
    |--------------------------------------------------------------------------
    | POLLING EVERY 10 SECONDS
    |--------------------------------------------------------------------------
    */

    const interval =
      setInterval(() => {

        fetchProviderLocation();

      }, 10000);


    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {

      clearInterval(
        interval
      );

    };

  }, [request?.status, id]);


  /*
  |--------------------------------------------------------------------------
  | CANCEL REQUEST
  |--------------------------------------------------------------------------
  */

  const handleCancel =
    async () => {

      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this request?"
        );


      if (!confirmed) {
        return;
      }


      try {

        setCancelLoading(
          true
        );


        const response =
          await api.post(
            `/customer/service-requests/${id}/cancel`
          );


        if (
          response.data.success
        ) {

          setRequest(
            response.data
              .service_request
          );

          setProviderLocation(
            null
          );

          setLastUpdated(
            null
          );

        }

      } catch (err) {

        console.error(
          "Cancel error:",
          err
        );


        alert(
          err.response?.data?.message ||
            "Unable to cancel request."
        );

      } finally {

        setCancelLoading(
          false
        );

      }
    };


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <RefreshCw
            size={32}
            className="animate-spin mx-auto mb-3 text-blue-600"
          />

          <p className="text-gray-600">
            Loading request...
          </p>

        </div>

      </div>

    );
  }


  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (
    error ||
    !request
  ) {

    return (

      <div className="min-h-screen bg-gray-50 p-6">

        <button
          onClick={() =>
            navigate(
              "/customer/my-requests"
            )
          }
          className="flex items-center gap-2 text-gray-700 mb-6"
        >

          <ArrowLeft
            size={18}
          />

          Back to My Requests

        </button>


        <div className="bg-white rounded-xl shadow-sm p-8 text-center">

          <XCircle
            size={50}
            className="mx-auto text-red-500 mb-4"
          />

          <h2 className="text-xl font-semibold text-gray-800">
            Request Not Found
          </h2>

          <p className="text-gray-500 mt-2">

            {error ||
              "Unable to find this service request."}

          </p>

        </div>

      </div>

    );
  }


  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const status =
    formatStatus(
      request.status
    );


  /*
  |--------------------------------------------------------------------------
  | CUSTOMER LOCATION
  |--------------------------------------------------------------------------
  */

  const customerLatitude =
    Number(
      request.latitude
    );

  const customerLongitude =
    Number(
      request.longitude
    );


  /*
  |--------------------------------------------------------------------------
  | PROVIDER LOCATION
  |--------------------------------------------------------------------------
  */

  const providerLatitude =
    providerLocation
      ? Number(
          providerLocation.latitude
        )
      : null;

  const providerLongitude =
    providerLocation
      ? Number(
          providerLocation.longitude
        )
      : null;


  /*
  |--------------------------------------------------------------------------
  | LOCATION VALIDATION
  |--------------------------------------------------------------------------
  */

  const hasCustomerLocation =
    Number.isFinite(
      customerLatitude
    ) &&
    Number.isFinite(
      customerLongitude
    );


  const hasProviderLocation =
    Number.isFinite(
      providerLatitude
    ) &&
    Number.isFinite(
      providerLongitude
    );


  /*
  |--------------------------------------------------------------------------
  | PROVIDER DISTANCE
  |--------------------------------------------------------------------------
  */

  const providerDistance =
    hasCustomerLocation &&
    hasProviderLocation
      ? calculateDistance(
          customerLatitude,
          customerLongitude,
          providerLatitude,
          providerLongitude
        )
      : null;


  /*
  |--------------------------------------------------------------------------
  | CAN CANCEL
  |--------------------------------------------------------------------------
  */

  const canCancel = [
    "searching",
    "provider_assigned",
    "provider_on_the_way",
    "arrived",
  ].includes(
    request.status
  );


  /*
  |--------------------------------------------------------------------------
  | LAST UPDATED TEXT
  |--------------------------------------------------------------------------
  */

  const getLastUpdatedText =
    () => {

      if (!lastUpdated) {
        return "Not available";
      }


      const seconds =
        Math.floor(
          (Date.now() -
            lastUpdated.getTime()) /
            1000
        );


      if (seconds < 5) {
        return "Just now";
      }


      if (seconds < 60) {
        return `${seconds} sec ago`;
      }


      const minutes =
        Math.floor(
          seconds / 60
        );


      if (minutes < 60) {
        return `${minutes} min ago`;
      }


      return lastUpdated.toLocaleTimeString();

    };


  /*
  |--------------------------------------------------------------------------
  | RETURN UI
  |--------------------------------------------------------------------------
  */

  return (

    <div className="min-h-screen bg-gray-50 p-4 md:p-6">


      {/* BACK BUTTON */}

      <button
        onClick={() =>
          navigate(
            "/customer/my-requests"
          )
        }
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 mb-6"
      >

        <ArrowLeft
          size={18}
        />

        Back to My Requests

      </button>


      {/* HEADER */}

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <p className="text-sm text-gray-500">
              Service Request
            </p>

            <h1 className="text-2xl font-bold text-gray-800">
              Request #{request.id}
            </h1>

          </div>


          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${status.className}`}
          >

            {status.label}

          </div>

        </div>

      </div>


      {/* LIVE MAP */}

      {hasCustomerLocation && (

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">


          {/* MAP HEADER */}

          <div className="p-5 border-b">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">


              <div className="flex items-center gap-3">

                <div className="p-2 bg-blue-100 rounded-lg">

                  <Navigation
                    size={20}
                    className="text-blue-600"
                  />

                </div>


                <div>

                  <h2 className="text-lg font-semibold text-gray-800">
                    Provider Location
                  </h2>

                  <p className="text-sm text-gray-500">

                    {hasProviderLocation
                      ? "Live provider location"
                      : "Waiting for provider location"}

                  </p>

                </div>

              </div>


              {/* REFRESH BUTTON */}

              <button
                onClick={
                  fetchProviderLocation
                }
                disabled={
                  locationLoading
                }
                className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >

                <RefreshCw
                  size={16}
                  className={
                    locationLoading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

          </div>


          {/* MAP */}

          <div className="h-[400px]">

            <MapContainer
              center={[
                customerLatitude,
                customerLongitude,
              ]}
              zoom={14}
              scrollWheelZoom={true}
              className="h-full w-full"
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />


              {/* CUSTOMER MARKER */}

              <Marker
                position={[
                  customerLatitude,
                  customerLongitude,
                ]}
              >

                <Popup>

                  <strong>
                    Customer Location
                  </strong>

                  <br />

                  Service location

                </Popup>

              </Marker>


              {/* CUSTOMER RADIUS */}

              <Circle
                center={[
                  customerLatitude,
                  customerLongitude,
                ]}
                radius={100}
                pathOptions={{
                  color: "blue",
                }}
              />


              {/* PROVIDER MOVING BIKE MARKER */}

              {hasProviderLocation && (

                <MovingProviderMarker
                  position={
                    providerLocation
                  }
                  distance={
                    providerDistance
                  }
                  lastUpdated={
                    lastUpdated
                  }
                />

              )}

            </MapContainer>

          </div>


          {/* MAP INFORMATION */}

          <div className="p-5">

            {hasProviderLocation ? (

              <div className="space-y-4">


                {/* DISTANCE */}

                <div className="flex items-center gap-3">

                  <div className="p-2 bg-blue-100 rounded-lg">

                    <Bike
                      size={20}
                      className="text-blue-600"
                    />

                  </div>


                  <div>

                    <p className="font-semibold text-gray-800">

                      Provider is{" "}

                      <span className="text-blue-600">

                        {formatDistance(
                          providerDistance
                        )}

                      </span>{" "}

                      away

                    </p>


                    <p className="text-sm text-gray-500">
                      Distance from your service location
                    </p>

                  </div>

                </div>


                {/* ONLINE STATUS */}

                <div className="flex items-center gap-3">

                  <div
                    className={`w-3 h-3 rounded-full ${
                      providerLocation.is_online
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />


                  <div>

                    <p className="font-medium text-gray-800">

                      {providerLocation.is_online
                        ? "Provider is online"
                        : "Provider is offline"}

                    </p>


                    <p className="text-sm text-gray-500">
                      Location updates automatically every 10 seconds.
                    </p>

                  </div>

                </div>


                {/* LAST UPDATED */}

                <div className="flex items-center gap-3">

                  <div className="p-2 bg-gray-100 rounded-lg">

                    <Clock
                      size={19}
                      className="text-gray-600"
                    />

                  </div>


                  <div>

                    <p className="font-medium text-gray-800">
                      Last updated
                    </p>


                    <p className="text-sm text-gray-500">

                      {getLastUpdatedText()}

                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div className="flex items-center gap-3">

                <div className="w-3 h-3 rounded-full bg-yellow-500" />

                <div>

                  <p className="font-medium text-gray-800">
                    Waiting for provider location
                  </p>

                  <p className="text-sm text-gray-500">
                    Provider location will appear when available.
                  </p>

                </div>

              </div>

            )}


            {/* LOCATION ERROR */}

            {locationError && (

              <p className="text-sm text-red-500 mt-3">

                {locationError}

              </p>

            )}

          </div>

        </div>

      )}


      {/* REQUEST INFORMATION */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* PROVIDER */}

        <div className="bg-white rounded-xl shadow-sm p-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Provider
          </h2>


          {request.provider ? (

            <div className="space-y-4">


              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">

                  <User
                    size={22}
                    className="text-blue-600"
                  />

                </div>


                <div>

                  <p className="font-semibold text-gray-800">

                    {request.provider.user?.name ||
                      request.provider.name ||
                      "Provider"}

                  </p>


                  <p className="text-sm text-gray-500">
                    Provider ID: {request.provider.id}
                  </p>

                </div>

              </div>


              {request.provider.user?.phone && (

                <div className="flex items-center gap-3 text-gray-600">

                  <Phone
                    size={18}
                  />

                  <span>
                    {request.provider.user.phone}
                  </span>

                </div>

              )}


              {request.provider.user?.email && (

                <div className="flex items-center gap-3 text-gray-600">

                  <Mail
                    size={18}
                  />

                  <span>
                    {request.provider.user.email}
                  </span>

                </div>

              )}

            </div>

          ) : (

            <div className="text-gray-500">

              Provider has not been assigned yet.

            </div>

          )}

        </div>


        {/* SERVICE */}

        <div className="bg-white rounded-xl shadow-sm p-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Service Details
          </h2>


          <div className="space-y-4">

            <div className="flex items-center gap-3">

              <div className="p-2 bg-orange-100 rounded-lg">

                <Wrench
                  size={20}
                  className="text-orange-600"
                />

              </div>


              <div>

                <p className="font-semibold text-gray-800">

                  {request.service?.name ||
                    "Service"}

                </p>


                <p className="text-sm text-gray-500">

                  {request.service?.category ||
                    ""}

                </p>

              </div>

            </div>


            {request.service?.description && (

              <p className="text-gray-600 text-sm">

                {request.service.description}

              </p>

            )}

          </div>

        </div>


        {/* LOCATION */}

        <div className="bg-white rounded-xl shadow-sm p-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Service Location
          </h2>


          <div className="flex gap-3">

            <MapPin
              size={20}
              className="text-red-500 flex-shrink-0"
            />


            <p className="text-gray-600">

              {request.address ||
                "Address not available"}

            </p>

          </div>

        </div>


        {/* REQUEST INFORMATION */}

        <div className="bg-white rounded-xl shadow-sm p-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Request Information
          </h2>


          <div className="space-y-4">


            {/* REQUEST TYPE */}

            <div className="flex items-center gap-3">

              <Clock
                size={19}
                className="text-gray-500"
              />


              <div>

                <p className="text-sm text-gray-500">
                  Request Type
                </p>


                <p className="font-medium text-gray-800">

                  {request.request_type ===
                  "now"
                    ? "Instant"
                    : "Scheduled"}

                </p>

              </div>

            </div>


            {/* SCHEDULED TIME */}

            {request.scheduled_at && (

              <div className="flex items-center gap-3">

                <Calendar
                  size={19}
                  className="text-gray-500"
                />


                <div>

                  <p className="text-sm text-gray-500">
                    Scheduled Time
                  </p>


                  <p className="font-medium text-gray-800">

                    {new Date(
                      request.scheduled_at
                    ).toLocaleString()}

                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* PROBLEM DESCRIPTION */}

      {request.problem_description && (

        <div className="bg-white rounded-xl shadow-sm p-5 mt-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Problem Description
          </h2>


          <p className="text-gray-600 leading-relaxed">

            {request.problem_description}

          </p>

        </div>

      )}


      {/* COMPLETED */}

      {request.status ===
        "service_completed" && (

        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6 flex items-center gap-3">

          <CheckCircle
            size={25}
            className="text-green-600"
          />


          <div>

            <p className="font-semibold text-green-800">
              Service Completed Successfully
            </p>


            <p className="text-sm text-green-700">
              Your service request has been completed.
            </p>

          </div>

        </div>

      )}


      {/* CANCELLED */}

      {request.status ===
        "cancelled" && (

        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mt-6 flex items-center gap-3">

          <XCircle
            size={25}
            className="text-red-600"
          />


          <div>

            <p className="font-semibold text-red-800">
              Request Cancelled
            </p>


            <p className="text-sm text-red-700">
              This service request has been cancelled.
            </p>

          </div>

        </div>

      )}


      {/* CANCEL BUTTON */}

      {canCancel && (

        <div className="mt-6 flex justify-end">

          <button
            onClick={
              handleCancel
            }
            disabled={
              cancelLoading
            }
            className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >

            {cancelLoading ? (

              <>

                <RefreshCw
                  size={17}
                  className="animate-spin"
                />

                Cancelling...

              </>

            ) : (

              <>

                <XCircle
                  size={17}
                />

                Cancel Request

              </>

            )}

          </button>

        </div>

      )}

    </div>
  );
}