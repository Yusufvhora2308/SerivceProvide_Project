import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Wrench,
  XCircle,
  CheckCircle,
  RefreshCw,
  IndianRupee,
  FileText,
  Clock,
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
| STATUS CONFIG
|--------------------------------------------------------------------------
*/

const statusConfig = {
  service_completed: {
    label: "Service Completed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },

  completed: {
    label: "Service Completed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "bg-rose-50 text-rose-700 border-rose-200/80",
  },
};

const formatStatus = (status) => {
  return (
    statusConfig[status] || {
      label: status
        ? status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "Unknown",
      className:
        "bg-slate-50 text-slate-700 border-slate-200/80",
    }
  );
};

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function ProviderBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH BOOKING
  |--------------------------------------------------------------------------
  */

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/provider/bookings/${id}`);

      console.log("PROVIDER BOOKING DETAILS:", response.data);

      if (response.data.success) {
        setBooking(
          response.data.service_request ||
            response.data.booking ||
            response.data.data
        );
      } else {
        setError(
          response.data.message ||
            "Unable to load booking details."
        );
      }
    } catch (err) {
      console.error("Provider booking details error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load booking details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw
            className="h-8 w-8 animate-spin text-blue-500"
          />

          <p className="text-sm font-medium text-slate-500">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR / NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-6">
        <div className="mx-auto max-w-5xl">

          <button
            onClick={() => navigate("/provider/bookings")}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 transition hover:bg-slate-50 mb-6"
          >
            <ArrowLeft size={16} />
            Back to My Bookings
          </button>

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <XCircle size={32} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Booking Not Found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {error ||
                "Unable to locate this booking."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const status = formatStatus(booking.status);

  const customer = booking.customer;
  const service = booking.service;

  const latitude = Number(booking.latitude);
  const longitude = Number(booking.longitude);

  const hasLocation =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  /*
  |--------------------------------------------------------------------------
  | PRICE
  |--------------------------------------------------------------------------
  */

  const basePrice = Number(
    booking.provider_service_price ||
      service?.base_price ||
      0
  );

  const extraCharges = Number(
    booking.extra_charges || 0
  );

  const finalPrice =
    booking.final_price !== null &&
    booking.final_price !== undefined
      ? Number(booking.final_price)
      : basePrice + extraCharges;

  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-8">

      <div className="mx-auto max-w-5xl space-y-6">

        {/* =========================================================
            TOP BAR
        ========================================================= */}

        <div className="flex items-center justify-between">

          <button
            onClick={() => navigate("/provider/bookings")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to My Bookings
          </button>

          <button
            onClick={fetchBooking}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw
              size={14}
              className="text-slate-400"
            />

            Refresh
          </button>

        </div>

        {/* =========================================================
            HERO STATUS CARD
        ========================================================= */}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Service Booking
              </span>

              <span className="text-xs text-slate-300">
                •
              </span>

              <span className="text-xs font-medium text-slate-500">
                ID #{booking.id}
              </span>

            </div>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {service?.name || "Service Booking"}
            </h1>

          </div>

          <div
            className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-1.5 text-xs font-semibold shadow-xs md:self-auto ${status.className}`}
          >
            <span className="h-2 w-2 rounded-full bg-current"></span>

            {status.label}
          </div>

        </div>

        {/* =========================================================
            LOCATION MAP
        ========================================================= */}

        {hasLocation && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

            {/* MAP HEADER */}

            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin size={20} />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Service Location
                  </h2>

                  <p className="text-xs text-slate-500">
                    Customer service destination
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">

                <MapPin
                  size={14}
                  className="text-slate-400"
                />

                Customer Location

              </div>

            </div>

            {/* MAP */}

            <div className="relative h-[380px] w-full">

              <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[latitude, longitude]}
                >

                  <Popup>

                    <div className="p-1">

                      <strong className="text-xs font-bold text-slate-900">
                        Customer Location
                      </strong>

                      <p className="text-[11px] text-slate-500 mt-1">
                        Service destination
                      </p>

                    </div>

                  </Popup>

                </Marker>

                <Circle
                  center={[latitude, longitude]}
                  radius={120}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#93c5fd",
                    fillOpacity: 0.25,
                  }}
                />

              </MapContainer>

            </div>

            {/* ADDRESS */}

            <div className="border-t border-slate-100 bg-slate-50/50 p-4">

              <div className="flex items-start gap-3">

                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Service Address
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {booking.address ||
                      customer?.address ||
                      "Address not provided"}
                  </p>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =========================================================
            TWO COLUMN DETAILS
        ========================================================= */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* =======================================================
              CUSTOMER DETAILS
          ======================================================= */}

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">

            <div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">

                <h2 className="text-base font-bold text-slate-900">
                  Customer Details
                </h2>

                <span className="text-xs font-medium text-slate-400">
                  Customer
                </span>

              </div>

              {customer ? (

                <div className="mt-5 space-y-4">

                  {/* CUSTOMER NAME */}

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <User size={22} />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-base font-bold text-slate-900">
                        {customer.name ||
                          "Customer"}
                      </p>

                      <p className="text-xs text-slate-400">
                        Customer ID #{customer.id}
                      </p>

                    </div>

                  </div>

                  {/* CONTACT */}

                  <div className="space-y-2 rounded-xl bg-slate-50/70 p-3.5 border border-slate-100 text-xs">

                    {customer.phone && (
                      <div className="flex items-center gap-2.5 text-slate-700">

                        <Phone
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="font-medium">
                          {customer.phone}
                        </span>

                      </div>
                    )}

                    {customer.email && (
                      <div className="flex items-center gap-2.5 text-slate-700">

                        <Mail
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="truncate font-medium">
                          {customer.email}
                        </span>

                      </div>
                    )}

                  </div>

                </div>

              ) : (

                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">

                  <User
                    size={28}
                    className="text-slate-300 mb-2"
                  />

                  <p className="text-sm font-semibold text-slate-700">
                    Customer information unavailable
                  </p>

                </div>

              )}

            </div>

            {/* CALL CUSTOMER */}

            {customer?.phone && (
              <div className="mt-5 pt-4 border-t border-slate-100">

                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-100/80 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-200 active:scale-[0.98]"
                >

                  <Phone size={15} />

                  Call Customer

                </a>

              </div>
            )}

          </div>

          {/* =======================================================
              SERVICE & BOOKING INFO
          ======================================================= */}

          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">

            <div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">

                <h2 className="text-base font-bold text-slate-900">
                  Service & Timing
                </h2>

                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">

                  {booking.request_type === "now"
                    ? "⚡ On-Demand"
                    : "📅 Scheduled"}

                </span>

              </div>

              <div className="mt-5 space-y-3.5 text-xs">

                {/* SERVICE CATEGORY */}

                <div className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">

                  <span className="flex items-center gap-2 text-slate-500 font-medium">

                    <Wrench
                      size={15}
                      className="text-blue-500"
                    />

                    Service Category

                  </span>

                  <span className="font-semibold text-slate-800">
                    {service?.category ||
                      "General Service"}
                  </span>

                </div>

                {/* DATE */}

                {booking.scheduled_at && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">

                    <span className="flex items-center gap-2 text-slate-500 font-medium">

                      <Calendar
                        size={15}
                        className="text-purple-500"
                      />

                      Scheduled Date

                    </span>

                    <span className="font-semibold text-slate-800 text-right">
                      {formatDate(
                        booking.scheduled_at
                      )}
                    </span>

                  </div>
                )}

                {/* CREATED DATE */}

                <div className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">

                  <span className="flex items-center gap-2 text-slate-500 font-medium">

                    <Clock
                      size={15}
                      className="text-slate-500"
                    />

                    Booking Date

                  </span>

                  <span className="font-semibold text-slate-800">
                    {formatDate(
                      booking.created_at
                    )}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =========================================================
            PRICE DETAILS
        ========================================================= */}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-2 mb-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

              <IndianRupee size={20} />

            </div>

            <div>

              <h2 className="text-base font-bold text-slate-900">
                Payment Details
              </h2>

              <p className="text-xs text-slate-500">
                Service amount summary
              </p>

            </div>

          </div>

          <div className="space-y-3">

            {/* BASE PRICE */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50/70 border border-slate-100 p-4">

              <span className="text-sm font-medium text-slate-500">
                Service Price
              </span>

              <span className="font-semibold text-slate-800">
                ₹
                {basePrice.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* EXTRA CHARGES */}

            {extraCharges > 0 && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50/70 border border-slate-100 p-4">

                <div>

                  <span className="text-sm font-medium text-slate-500">
                    Extra Charges
                  </span>

                  {booking.extra_charges_reason && (
                    <p className="text-xs text-slate-400 mt-1">
                      {booking.extra_charges_reason}
                    </p>
                  )}

                </div>

                <span className="font-semibold text-slate-800">
                  ₹
                  {extraCharges.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>
            )}

            {/* FINAL PRICE */}

            <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 p-4">

              <span className="text-sm font-bold text-blue-700">
                Final Amount
              </span>

              <span className="text-lg font-bold text-blue-700">
                ₹
                {finalPrice.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

          </div>

        </div>

        {/* =========================================================
            PROBLEM DESCRIPTION
        ========================================================= */}

        {booking.problem_description && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-2 mb-3">

              <FileText
                size={18}
                className="text-blue-500"
              />

              <h2 className="text-base font-bold text-slate-900">
                Problem Description
              </h2>

            </div>

            <p className="text-sm leading-relaxed text-slate-600 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              {booking.problem_description}
            </p>

          </div>
        )}

        {/* =========================================================
            COMPLETED BANNER
        ========================================================= */}

        {(booking.status === "service_completed" ||
          booking.status === "completed") && (

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-800">

            <CheckCircle
              size={24}
              className="text-emerald-600 shrink-0"
            />

            <div>

              <p className="font-bold text-sm">
                Service Completed Successfully
              </p>

              <p className="text-xs text-emerald-700 mt-0.5">
                This booking has been successfully completed.
              </p>

            </div>

          </div>
        )}

        {/* =========================================================
            CANCELLED BANNER
        ========================================================= */}

        {booking.status === "cancelled" && (

          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-rose-800">

            <XCircle
              size={24}
              className="text-rose-600 shrink-0"
            />

            <div>

              <p className="font-bold text-sm">
                Booking Cancelled
              </p>

              <p className="text-xs text-rose-700 mt-0.5">
                This service booking was cancelled and is no longer active.
              </p>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}