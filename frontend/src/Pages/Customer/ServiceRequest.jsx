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
} from "lucide-react";
import api from "../../api/axios";
import LocationPicker from "../../components/Customer/LocationPicker";

const ServiceRequest = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);

  const [formData, setFormData] = useState({
    address: "",
    latitude: "",
    longitude: "",
    problem_description: "",
    request_type: "now",
    scheduled_at: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/services/${serviceId}`);
      setService(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load service.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/service-requests", {
        service_id: serviceId,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        problem_description: formData.problem_description,
        request_type: formData.request_type,
        scheduled_at:
          formData.request_type === "scheduled" ? formData.scheduled_at : null,
      });

      alert("Service request created successfully!");
      navigate("/customer/dashboard");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors).flat().join(" "));
      } else {
        setError("Unable to create service request.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading service details...
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-slate-50/50 p-4">
        <p className="text-xs font-medium text-red-500 sm:text-sm">
          {error || "Service not found."}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] w-full overflow-x-hidden bg-slate-50/50 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        {/* Back Button & Top Meta */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified & Protected Booking
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
            {/* =========================================
                RIGHT SIDE ON DESKTOP / TOP ON MOBILE: Location Picker (5 cols)
                (order-1 on mobile, lg:order-2 on desktop)
                ========================================= */}
            <div className="order-1 space-y-4 lg:order-2 lg:col-span-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Pin Exact Location
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    GPS Accurate
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 min-h-[220px] sm:min-h-[280px]">
                  <LocationPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={({ latitude, longitude, address }) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude,
                        longitude,
                        address: address || prev.address,
                      }));
                    }}
                  />
                </div>
              </div>
            </div>

            {/* =========================================
                LEFT SIDE: Service Details, Form Fields & Submit Button (7 cols)
                (order-2 on mobile, lg:order-1 on desktop)
                ========================================= */}
            <div className="order-2 space-y-4 lg:order-1 lg:col-span-7">
              {/* Service Summary Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                      <Sparkles className="h-3 w-3" /> Service Request
                    </span>
                    <h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                      {service.name}
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {service.category || "Home Care & Maintenance"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-medium text-slate-400 block">
                      Starting at
                    </span>
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      ₹{service.base_price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              {/* Address Input */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
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
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                />
              </div>

              {/* Problem Description */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
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
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 sm:text-sm"
                />
              </div>

              {/* Timing Selection */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  When do you need the service?
                </label>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      formData.request_type === "now"
                        ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap
                        className={`h-4 w-4 ${formData.request_type === "now" ? "text-blue-600" : "text-slate-400"}`}
                      />
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold">
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
                      checked={formData.request_type === "now"}
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      formData.request_type === "scheduled"
                        ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar
                        className={`h-4 w-4 ${formData.request_type === "scheduled" ? "text-blue-600" : "text-slate-400"}`}
                      />
                      <div>
                        <span className="block text-xs sm:text-sm font-semibold">
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
                      checked={formData.request_type === "scheduled"}
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.request_type === "scheduled" && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <input
                      type="datetime-local"
                      name="scheduled_at"
                      value={formData.scheduled_at}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                )}
              </div>

              {/* Confirm / Submit Button Card (Positioned on Left Side) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 sm:h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating Request...
                    </div>
                  ) : (
                    "Confirm & Request Service"
                  )}
                </button>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  No advance payment required. Pay after service completion.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ServiceRequest;