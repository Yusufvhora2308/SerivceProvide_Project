// PATH: src/Pages/Customer/MyBookings.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Eye,
  XCircle,
  Loader2,
  ClipboardList,
  User,
} from "lucide-react";

import api from "../../api/axios";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | GET CUSTOMER BOOKINGS
  |--------------------------------------------------------------------------
  */

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customer/service-requests");

      if (response.data.success) {
        setBookings(response.data.service_requests || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("My Bookings Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CANCEL BOOKING
  |--------------------------------------------------------------------------
  */

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      await api.post(
        `/customer/service-requests/${id}/cancel`
      );

      // Refresh booking list
      fetchBookings();
    } catch (err) {
      console.error("Cancel Booking Error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to cancel booking."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS STYLE
  |--------------------------------------------------------------------------
  */

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning-subtle text-warning-emphasis";

      case "accepted":
        return "bg-primary-subtle text-primary";

      case "on_the_way":
        return "bg-info-subtle text-info-emphasis";

      case "started":
        return "bg-success-subtle text-success";

      case "completed":
        return "bg-success text-white";

      case "cancelled":
        return "bg-danger-subtle text-danger";

      case "rejected":
        return "bg-danger text-white";

      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STATUS LABEL
  |--------------------------------------------------------------------------
  */

  const getStatusLabel = (status) => {
    switch (status) {
      case "on_the_way":
        return "On the Way";

      case "started":
        return "Service Started";

      case "pending":
        return "Pending";

      case "accepted":
        return "Accepted";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      case "rejected":
        return "Rejected";

      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Unknown";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DATE FORMAT
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "Not scheduled";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | TIME FORMAT
  |--------------------------------------------------------------------------
  */

  const formatTime = (date) => {
    if (!date) {
      return "Instant Service";
    }

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center py-5">
          <Loader2
            size={40}
            className="spinner-border text-primary"
          />
        </div>

        <p className="text-center text-muted">
          Loading your bookings...
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <button
            className="btn btn-light mb-3"
            onClick={() => navigate("/customer/dashboard")}
          >
            <ArrowLeft size={18} className="me-2" />
            Back
          </button>

          <h2 className="fw-bold mb-1">
            My Bookings
          </h2>

          <p className="text-muted mb-0">
            Track and manage your service requests
          </p>
        </div>

        <div className="bg-primary text-white rounded-circle p-3">
          <ClipboardList size={28} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* No Bookings */}
      {!error && bookings.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">

            <ClipboardList
              size={55}
              className="text-muted mb-3"
            />

            <h4 className="fw-bold">
              No Bookings Yet
            </h4>

            <p className="text-muted">
              You haven't booked any services yet.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/customer/services")}
            >
              Browse Services
            </button>

          </div>
        </div>
      )}

      {/* Booking List */}
      <div className="row g-4">

        {bookings.map((booking) => (
          <div
            className="col-12"
            key={booking.id}
          >

            <div className="card border-0 shadow-sm">

              <div className="card-body p-4">

                {/* Top */}
                <div className="d-flex justify-content-between align-items-start mb-3">

                  <div>
                    <h4 className="fw-bold mb-1">
                      {booking.service?.name ||
                        "Service"}
                    </h4>

                    <small className="text-muted">
                      Booking #{booking.id}
                    </small>
                  </div>

                  <span
                    className={`badge rounded-pill px-3 py-2 ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {getStatusLabel(
                      booking.status
                    )}
                  </span>

                </div>

                <hr />

                {/* Booking Information */}
                <div className="row g-3">

                  {/* Request Type */}
                  <div className="col-md-6">

                    <div className="d-flex align-items-center">

                      <div className="bg-primary-subtle rounded p-2 me-3">
                        <Clock
                          size={20}
                          className="text-primary"
                        />
                      </div>

                      <div>
                        <small className="text-muted">
                          Request Type
                        </small>

                        <div className="fw-semibold">
                          {booking.request_type ===
                          "scheduled"
                            ? "Scheduled"
                            : "Instant"}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Date */}
                  <div className="col-md-6">

                    <div className="d-flex align-items-center">

                      <div className="bg-success-subtle rounded p-2 me-3">
                        <Calendar
                          size={20}
                          className="text-success"
                        />
                      </div>

                      <div>
                        <small className="text-muted">
                          Date & Time
                        </small>

                        <div className="fw-semibold">
                          {formatDate(
                            booking.scheduled_at
                          )}

                          {" • "}

                          {formatTime(
                            booking.scheduled_at
                          )}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Provider */}
                  <div className="col-md-6">

                    <div className="d-flex align-items-center">

                      <div className="bg-info-subtle rounded p-2 me-3">
                        <User
                          size={20}
                          className="text-info"
                        />
                      </div>

                      <div>
                        <small className="text-muted">
                          Service Provider
                        </small>

                        <div className="fw-semibold">
                          {booking.provider?.name ||
                            "Not assigned yet"}
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Address */}
                  <div className="col-md-6">

                    <div className="d-flex align-items-center">

                      <div className="bg-danger-subtle rounded p-2 me-3">
                        <MapPin
                          size={20}
                          className="text-danger"
                        />
                      </div>

                      <div>
                        <small className="text-muted">
                          Service Location
                        </small>

                        <div className="fw-semibold">
                          {booking.address ||
                            "Address not available"}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Problem Description */}
                {booking.problem_description && (
                  <div className="mt-4">

                    <small className="text-muted">
                      Problem Description
                    </small>

                    <p className="mb-0 mt-1">
                      {booking.problem_description}
                    </p>

                  </div>
                )}

                <hr />

                {/* Actions */}
                <div className="d-flex justify-content-end gap-2">

                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      navigate(
                        `/customer/bookings/${booking.id}`
                      )
                    }
                  >
                    <Eye
                      size={17}
                      className="me-2"
                    />
                    View Details
                  </button>

                  {[
                    "pending",
                    "accepted",
                  ].includes(booking.status) && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={() =>
                        handleCancel(booking.id)
                      }
                    >
                      <XCircle
                        size={17}
                        className="me-2"
                      />
                      Cancel
                    </button>
                  )}

                </div>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default MyBookings;

