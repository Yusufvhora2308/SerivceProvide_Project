import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Wrench,
  Clock,
  CheckCircle,
  Navigation,
  Play,
  Loader2,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  Compass,
  Radio,
  X,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import api from "../../api/axios";

// CUSTOMER ICON
const customerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowSize: [32, 32],
});

// COMPACT PROVIDER BIKE ICON
const providerIcon = L.divIcon({
  className: "provider-bike-marker",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      background: #0284c7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid white;
      box-shadow: 0 3px 10px rgba(2, 132, 199, 0.4);
      font-size: 15px;
    ">
      🛵
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

// MAP RE-CENTER
const MapCenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position, map]);
  return null;
};

// SMOOTH PROVIDER MARKER
const SmoothProviderMarker = ({ position }) => {
  const markerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!position || !markerRef.current) return;
    const marker = markerRef.current;
    const current = marker.getLatLng();
    const startLat = current.lat;
    const startLng = current.lng;
    const endLat = position[0];
    const endLng = position[1];

    if (startLat === endLat && startLng === endLng) return;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;
      marker.setLatLng([lat, lng]);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        marker.setLatLng([endLat, endLng]);
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [position]);

  return (
    <Marker ref={markerRef} position={position} icon={providerIcon}>
      <Popup>
        <div className="p-0.5 text-[11px]">
          <strong className="text-slate-900">Your Location</strong>
          <p className="text-slate-500 mt-0.5">Live provider coordinates</p>
        </div>
      </Popup>
    </Marker>
  );
};

// HAVERSINE DISTANCE
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;

  const R = 6371;
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const ProviderRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [providerLocation, setProviderLocation] = useState(null);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/provider/service-requests/${id}`);
      if (response.data.success) {
        setRequest(response.data.request || response.data.service_request);
      } else {
        setError(response.data.message || "Unable to load request.");
      }
    } catch (err) {
      console.error("Request Fetch Error:", err);
      setError(err.response?.data?.message || "Unable to load service request.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderLocation = async () => {
    try {
      setLocationLoading(true);
      const response = await api.get(`/provider/service-requests/${id}/live-location`);
      if (response.data.success && response.data.provider_location) {
        const location = response.data.provider_location;
        const lat = Number(location.latitude);
        const lng = Number(location.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          setProviderLocation([lat, lng]);
        }
      }
    } catch (err) {
      console.error("Provider Location Error:", err);
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  useEffect(() => {
    if (!request) return;
    const liveStatuses = [
      "provider_assigned",
      "provider_on_the_way",
      "arrived",
      "service_started",
    ];
    if (!liveStatuses.includes(request.status)) return;

    fetchProviderLocation();
    const interval = setInterval(fetchProviderLocation, 10000);
    return () => clearInterval(interval);
  }, [request?.status, id]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      const response = await api.put(`/provider/service-requests/${id}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        setRequest(response.data.request || response.data.service_request);
        setSuccess(response.data.message || "Status updated.");
        fetchProviderLocation();
      } else {
        setError(response.data.message || "Unable to update status.");
      }
    } catch (err) {
      console.error("Status Update Error:", err);
      setError(err.response?.data?.message || "Unable to update request status.");
    } finally {
      setUpdating(false);
    }
  };

  const cancelRequest = async () => {
    if (!window.confirm("Are you sure you want to cancel this service job?")) return;
    try {
      setUpdating(true);
      setError("");
      setSuccess("");
      const response = await api.post(`/provider/service-requests/${id}/cancel`);
      if (response.data.success) {
        setRequest((prev) => ({ ...prev, status: "cancelled" }));
        setSuccess("Job cancelled successfully.");
      } else {
        setError(response.data.message || "Unable to cancel request.");
      }
    } catch (err) {
      console.error("Cancel Error:", err);
      setError(err.response?.data?.message || "Unable to cancel request.");
    } finally {
      setUpdating(false);
    }
  };

  const getNextAction = () => {
    if (!request) return null;
    switch (request.status) {
      case "provider_assigned":
        return {
          status: "provider_on_the_way",
          label: "Start Journey",
          icon: Navigation,
        };
      case "provider_on_the_way":
        return {
          status: "arrived",
          label: "Mark Arrived",
          icon: MapPin,
        };
      case "arrived":
        return {
          status: "service_started",
          label: "Start Service",
          icon: Play,
        };
      case "service_started":
        return {
          status: "service_completed",
          label: "Complete Service",
          icon: CheckCircle,
        };
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "provider_assigned":
        return { label: "Assigned", className: "bg-sky-50 text-sky-700 border-sky-200" };
      case "provider_on_the_way":
        return { label: "On Way", className: "bg-blue-50 text-blue-700 border-blue-200" };
      case "arrived":
        return { label: "Arrived", className: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "service_started":
        return { label: "In Progress", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case "service_completed":
        return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "cancelled":
        return { label: "Cancelled", className: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: status?.replaceAll("_", " ") || "In Review", className: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/60">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-blue-600" />
          <p className="text-[11px] font-semibold text-slate-500">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-4">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-xs">
            <AlertCircle size={30} className="mx-auto text-rose-500 mb-2" />
            <h2 className="text-sm font-bold text-slate-900">Request Not Found</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">{error || "Unable to find this request."}</p>
          </div>
        </div>
      </div>
    );
  }

  const customerPosition =
    request.latitude && request.longitude
      ? [Number(request.latitude), Number(request.longitude)]
      : null;

  const currentProviderPosition = providerLocation;
  const routeLine =
    customerPosition && currentProviderPosition
      ? [currentProviderPosition, customerPosition]
      : [];

  const distanceKm =
    customerPosition && currentProviderPosition
      ? calculateDistance(
          currentProviderPosition[0],
          currentProviderPosition[1],
          customerPosition[0],
          customerPosition[1]
        )
      : null;

  const nextAction = getNextAction();
  const statusInfo = getStatusBadge(request.status);
  const canCancel = [
    "provider_assigned",
    "provider_on_the_way",
    "arrived",
  ].includes(request.status);

  return (
    <div className="min-h-screen bg-slate-50/60 p-3 sm:p-5">
      <div className="mx-auto max-w-5xl space-y-3.5">

        {/* TOP BAR NAVIGATION */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Dashboard
          </button>

          <button
            onClick={() => {
              fetchRequest();
              fetchProviderLocation();
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-95"
          >
            <RefreshCw
              size={11}
              className={locationLoading ? "animate-spin text-blue-600" : "text-slate-400"}
            />
            Sync
          </button>
        </div>

        {/* ALERTS */}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs font-medium text-emerald-800">
            <CheckCircle size={14} className="shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-medium text-rose-800">
            <AlertCircle size={14} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. COMPACT MAP CARD */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          {/* MAP HEADER */}
          <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-blue-600">
                <Navigation size={14} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 leading-none">
                  Live Dispatch Navigation
                </h2>
                <span className="text-[10px] text-slate-400">
                  Real-time GPS tracking
                </span>
              </div>
            </div>

            {currentProviderPosition ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live GPS
              </div>
            ) : (
              <span className="text-[10px] text-slate-400">Locating...</span>
            )}
          </div>

          {/* MAP CANVAS */}
          <div className="relative h-[240px] w-full sm:h-[280px]">
            {customerPosition ? (
              <MapContainer
                center={currentProviderPosition || customerPosition}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapCenter position={currentProviderPosition || customerPosition} />

                <Marker position={customerPosition} icon={customerIcon}>
                  <Popup>
                    <div className="p-0.5 text-[11px]">
                      <strong className="text-slate-900">Destination</strong>
                      <p className="text-slate-500 mt-0.5">{request.address || "Customer location"}</p>
                    </div>
                  </Popup>
                </Marker>

                {currentProviderPosition && (
                  <SmoothProviderMarker position={currentProviderPosition} />
                )}

                {routeLine.length === 2 && (
                  <Polyline
                    positions={routeLine}
                    pathOptions={{
                      color: "#0284c7",
                      weight: 3,
                      opacity: 0.8,
                      dashArray: "6, 6",
                    }}
                  />
                )}
              </MapContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <MapPin size={28} className="text-slate-300 mb-1" />
                <p className="text-[11px] text-slate-500">Customer coordinates not provided</p>
              </div>
            )}
          </div>

          {/* MAP METRICS STRIP */}
          <div className="grid grid-cols-3 divide-x border-t border-slate-100 bg-slate-50/60 text-center py-2 px-1 text-[11px]">
            <div>
              <span className="text-[9px] uppercase font-semibold text-slate-400 block">Distance</span>
              <span className="font-bold text-slate-800">
                {distanceKm ? `${distanceKm} km` : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-semibold text-slate-400 block">GPS Sync</span>
              <span className="font-bold text-slate-800">
                {locationLoading ? "Syncing..." : "Active"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-semibold text-slate-400 block">Phase</span>
              <span className="font-bold text-slate-800">
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* 2. COMPACT ACTION BANNER */}
        {(nextAction || canCancel) && (
          <div className="flex flex-col gap-2 rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-50/80 via-sky-100/40 to-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-sky-800">
                Job Milestone
              </span>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                {statusInfo.label}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {canCancel && (
                <button
                  type="button"
                  onClick={cancelRequest}
                  disabled={updating}
                  className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

              {nextAction && (
                <button
                  type="button"
                  onClick={() => updateStatus(nextAction.status)}
                  disabled={updating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100/90 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-xs hover:bg-blue-100 active:scale-95 disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 size={13} className="animate-spin text-blue-600" />
                  ) : (
                    <nextAction.icon size={13} />
                  )}
                  <span>{nextAction.label}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. COMPACT TWO-COLUMN CARDS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* CUSTOMER CARD */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">Customer</h3>
                </div>
                <span className="text-[10px] text-slate-400">#{request.id}</span>
              </div>

              <div className="mt-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-blue-600">
                    <User size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {request.customer?.name || request.user?.name || "Customer"}
                    </p>
                    <p className="text-[10px] text-slate-400">Client</p>
                  </div>
                </div>

                <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-[11px]">
                  {(request.customer?.phone || request.user?.phone) && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone size={12} className="text-slate-400" />
                      <span className="font-semibold">
                        {request.customer?.phone || request.user?.phone}
                      </span>
                    </div>
                  )}

                  {(request.customer?.email || request.user?.email) && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail size={12} className="text-slate-400" />
                      <span className="truncate">
                        {request.customer?.email || request.user?.email}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 pt-0.5 text-slate-700">
                    <MapPin size={12} className="mt-0.5 shrink-0 text-rose-500" />
                    <span className="leading-tight line-clamp-2">
                      {request.address || "Address not provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {(request.customer?.phone || request.user?.phone) && (
              <div className="mt-3 border-t border-slate-100 pt-2">
                <a
                  href={`tel:${request.customer?.phone || request.user?.phone}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-100/80 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 active:scale-95"
                >
                  <Phone size={12} />
                  Call Customer
                </a>
              </div>
            )}
          </div>

          {/* SERVICE DETAILS CARD */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Wrench size={14} className="text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900">Service Info</h3>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="mt-2.5 space-y-2 text-[11px]">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-slate-400 block">Service</span>
                    <p className="text-xs font-bold text-slate-900">
                      {request.service?.name || "Request"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-semibold text-slate-400 block">Payout</span>
                    <p className="flex items-center text-xs font-extrabold text-slate-900">
                      <IndianRupee size={11} className="text-emerald-600" />
                      {Number(request.service?.base_price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Clock size={12} className="text-blue-500" />
                    Type
                  </span>
                  <span className="font-semibold text-slate-800">
                    {request.request_type === "now" ? "⚡ Now" : "📅 Scheduled"}
                  </span>
                </div>

                {request.scheduled_at && (
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-1.5">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock size={12} className="text-purple-500" />
                      Time
                    </span>
                    <span className="font-semibold text-slate-800">
                      {new Date(request.scheduled_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {request.problem_description && (
              <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2 text-[11px] text-slate-600 line-clamp-2">
                <span className="font-bold text-slate-800">Note: </span>
                {request.problem_description}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProviderRequestDetails;