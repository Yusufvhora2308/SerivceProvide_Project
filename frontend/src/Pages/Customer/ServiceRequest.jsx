// PATH: src/Pages/Customer/ServiceRequest.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  User,
  Star,
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Swal from "sweetalert2";

import api from "../../api/axios";
import LocationPicker from "../../components/Customer/LocationPicker";

const ServiceRequest = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  // --------------------------------------------------
  // SERVICE
  // --------------------------------------------------

  const [service, setService] = useState(null);

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const [formData, setFormData] = useState({
    address: "",
    latitude: "",
    longitude: "",
    problem_description: "",
    request_type: "now",
    scheduled_at: "",
  });

  // --------------------------------------------------
  // PAGE STATES
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH SERVICE
  // --------------------------------------------------

  useEffect(() => {
    if (!serviceId) {
      setError("Service ID is missing.");
      setLoading(false);
      return;
    }

    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/services/${serviceId}`
      );

      console.log("Service Details API:", response.data);

      const serviceData =
        response.data?.service ||
        response.data?.data;

      if (!serviceData) {
        setError("Service not found.");
        setService(null);
        return;
      }

      setService(serviceData);
    } catch (err) {
      console.error(
        "Service Details Error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load service."
      );

      setService(null);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // LOCATION CHANGE
  // --------------------------------------------------

  const handleLocationChange = ({
    latitude,
    longitude,
    address,
  }) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
      address: address || prev.address,
    }));
  };

  // --------------------------------------------------
  // SUBMIT REQUEST
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -----------------------------------------------
    // LOCATION VALIDATION
    // -----------------------------------------------

    if (
      !formData.latitude ||
      !formData.longitude
    ) {
      await Swal.fire({
        title: "Location Required",
        text: "Please select your service location on the map.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    // -----------------------------------------------
    // ADDRESS VALIDATION
    // -----------------------------------------------

    if (!formData.address.trim()) {
      await Swal.fire({
        title: "Address Required",
        text: "Please enter your complete address.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    // -----------------------------------------------
    // SCHEDULE VALIDATION
    // -----------------------------------------------

    if (
      formData.request_type === "scheduled" &&
      !formData.scheduled_at
    ) {
      await Swal.fire({
        title: "Schedule Required",
        text: "Please select date and time.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    try {
      setSubmitting(true);

      // -----------------------------------------------
      // REQUEST PAYLOAD
      // -----------------------------------------------
      // IMPORTANT:
      // No provider_id is sent from customer side.
      //
      // Backend will automatically find the nearest
      // valid provider who provides this service.

      const payload = {
        service_id: Number(serviceId),

        address: formData.address.trim(),

        latitude: Number(formData.latitude),

        longitude: Number(formData.longitude),

        problem_description:
          formData.problem_description.trim() || null,

        request_type: formData.request_type,

        scheduled_at:
          formData.request_type === "scheduled"
            ? formData.scheduled_at
            : null,
      };

      console.log(
        "Creating Service Request:",
        payload 
      );

      const response = await api.post(
        "/customer/service-requests",
        payload
      );

      console.log(
        "Create Service Request API:",
        response.data
      );

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      await Swal.fire({
        title: "Request Created Successfully!",
        text:
          "We are finding a nearby service provider for you.",
        icon: "success",
        confirmButtonText: "View My Requests",
        confirmButtonColor: "#2563eb",
      });

      navigate("/customer/requests");
    } catch (err) {
      console.error(
        "Create Service Request Error:",
        err.response?.data || err.message
      );

      // -----------------------------------------------
      // VALIDATION ERRORS
      // -----------------------------------------------

      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors) {
        const messages = Object.values(
          validationErrors
        )
          .flat()
          .join(" ");

        setError(messages);

        await Swal.fire({
          title: "Validation Error",
          text: messages,
          icon: "warning",
          confirmButtonText: "OK",
        });
      } else {
        const message =
          err.response?.data?.message ||
          "Unable to create service request.";

        setError(message);

        await Swal.fire({
          title: "Request Failed",
          text: message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // LOADING PAGE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />

          Loading service details...
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // SERVICE NOT FOUND
  // --------------------------------------------------

  if (!service) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 p-4">
        <AlertCircle className="h-10 w-10 text-red-400" />

        <p className="mt-3 text-xs font-medium text-red-500 sm:text-sm">
          {error || "Service not found."}
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="relative min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-slate-50/50 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col">

        {/* TOP BAR */}

        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />

            Back
          </button>

          <div className="hidden items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5" />

            Verified & Protected Booking
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full"
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">

            {/* ==================================================
                LEFT SIDE
            ================================================== */}

            <div className="order-2 space-y-4 lg:order-1 lg:col-span-7">

              {/* SERVICE SUMMARY */}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                      <Sparkles className="h-3 w-3" />

                      Service Request
                    </span>

                    <h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                      {service.name}
                    </h1>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {service.category ||
                        "Home Care & Maintenance"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] font-medium uppercase text-slate-400">
                      Starting at
                    </span>

                    <span className="text-base font-bold text-slate-900 sm:text-lg">
                      ₹
                      {Number(
                        service.base_price || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-medium text-red-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{error}</span>
                </div>
              )}

              {/* ==================================================
                  ADDRESS
              ================================================== */}

              <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">
                  <MapPin className="h-4 w-4 text-blue-600" />

                  Complete Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Flat No., Landmark, Street Name..."
                  rows="3"
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                />

              </div>

              {/* ==================================================
                  PROBLEM
              ================================================== */}

              <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">
                  <FileText className="h-4 w-4 text-blue-600" />

                  Describe Problem / Requirements
                </label>

                <textarea
                  name="problem_description"
                  value={formData.problem_description}
                  onChange={handleChange}
                  placeholder="E.g., AC is making rattling noise and cooling is weak..."
                  rows="3"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                />

              </div>

              {/* ==================================================
                  TIMING
              ================================================== */}

              <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />

                  When do you need the service?
                </label>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

                  {/* NOW */}

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      formData.request_type === "now"
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap
                        className={`h-4 w-4 ${
                          formData.request_type === "now"
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      />

                      <div>
                        <span className="block text-xs font-semibold sm:text-sm">
                          Immediate
                        </span>

                        <span className="block text-[10px] text-slate-400">
                          Available expert
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="request_type"
                      value="now"
                      checked={
                        formData.request_type === "now"
                      }
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>

                  {/* SCHEDULE */}

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      formData.request_type === "scheduled"
                        ? "border-blue-600 bg-blue-50/60 text-blue-900 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar
                        className={`h-4 w-4 ${
                          formData.request_type === "scheduled"
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      />

                      <div>
                        <span className="block text-xs font-semibold sm:text-sm">
                          Schedule
                        </span>

                        <span className="block text-[10px] text-slate-400">
                          Pick date & time
                        </span>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="request_type"
                      value="scheduled"
                      checked={
                        formData.request_type === "scheduled"
                      }
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>

                </div>

                {/* SCHEDULE DATE/TIME */}

                {formData.request_type === "scheduled" && (
                  <div className="pt-2">
                    <input
                      type="datetime-local"
                      name="scheduled_at"
                      value={formData.scheduled_at}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                    />
                  </div>
                )}

              </div>

              {/* ==================================================
                  SUBMIT
              ================================================== */}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:text-sm"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Finding Service Provider...
                    </div>
                  ) : (
                    <>
                      Confirm & Request Service
                    </>
                  )}
                </button>

                <p className="mt-2 text-center text-[10px] text-slate-400">
                  No advance payment required. Pay after service completion.
                </p>

              </div>

            </div>

            {/* ==================================================
                RIGHT SIDE LOCATION
            ================================================== */}

            <div className="order-1 space-y-4 lg:sticky lg:top-24 lg:order-2 lg:col-span-5">

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">

                <div className="mb-3 flex items-center justify-between">

                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />

                    Pin Exact Location
                  </span>

                  <span className="text-[10px] font-medium text-slate-400">
                    GPS Accurate
                  </span>

                </div>

                <div className="min-h-[220px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:min-h-[280px]">

                  <LocationPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleLocationChange}
                  />

                </div>

                {/* COORDINATES */}

                {formData.latitude &&
                  formData.longitude && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3">

                      <div className="flex items-center gap-2">

                        <CheckCircle2
                          size={15}
                          className="text-green-600"
                        />

                        <span className="text-[10px] font-semibold text-slate-600">
                          Location selected
                        </span>

                      </div>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Lat: {formData.latitude}
                        {" • "}
                        Lng: {formData.longitude}
                      </p>

                    </div>
                  )}

              </div>

              {/* AUTOMATIC PROVIDER MESSAGE */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <MapPin size={17} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-blue-900">
                      We'll Find a Provider for You
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-blue-700">
                      After you submit the request, QuickFix will
                      automatically find nearby verified providers
                      who offer this service.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </form>

      </div>
    </main>
  );
};

export default ServiceRequest;
