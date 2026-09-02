// PATH: src/Pages/Provider/AddService.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";

import api from "../../api/axios";

const AddService = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    service_id: "",
    price: "",
    experience: "",
    service_area: "",
    service_image: null,
    is_active: true,
  });

  const [selectedService, setSelectedService] = useState(null);

  // Fetch default/master services
  useEffect(() => {
    fetchAvailableServices();
  }, []);

  const fetchAvailableServices = async () => {
    try {
      setLoadingServices(true);

      const response = await api.get(
        "/provider/available-services"
      );

      setServices(response.data.services || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to load available services."
      );
    } finally {
      setLoadingServices(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "service_id") {
      const service = services.find(
        (item) => String(item.id) === String(value)
      );

      setSelectedService(service || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.service_id) {
      setError("Please select a service.");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();

      data.append("service_id", formData.service_id);
      data.append("price", formData.price);
      data.append("experience", formData.experience);
      data.append("service_area", formData.service_area);
      data.append(
        "is_active",
        formData.is_active ? "1" : "0"
      );

      if (formData.service_image) {
        data.append(
          "service_image",
          formData.service_image
        );
      }

      await api.post("/provider/services", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Service added successfully.");

      setTimeout(() => {
        navigate("/provider/services");
      }, 700);

    } catch (error) {
      console.error("Add service error:", error);

      if (error.response?.data?.errors) {
        const validationErrors =
          error.response.data.errors;

        const firstError =
          Object.values(validationErrors)[0]?.[0];

        setError(
          firstError || "Please check the form."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to add service."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">

          <button
            onClick={() => navigate("/provider/services")}
            className="p-2 rounded-lg hover:bg-white transition"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Add New Service
            </h1>

            <p className="text-gray-500 mt-1">
              Add a service that you provide.
            </p>
          </div>

        </div>


        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-7"
        >

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
              {success}
            </div>
          )}


          {/* Service */}
          <div className="mb-5">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service
            </label>

            {loadingServices ? (
              <div className="flex items-center gap-2 text-gray-500 py-3">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Loading services...
              </div>
            ) : (
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  Select Service
                </option>

                {services.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.name}
                  </option>
                ))}
              </select>
            )}

          </div>


          {/* Auto service information */}
          {selectedService && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">

              <p className="text-sm text-blue-600 font-semibold">
                {selectedService.category}
              </p>

              <h3 className="font-bold text-gray-900 mt-1">
                {selectedService.name}
              </h3>

              {selectedService.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedService.description}
                </p>
              )}

              <p className="text-sm text-gray-500 mt-2">
                Base price: ₹{selectedService.base_price}
              </p>

            </div>
          )}


          {/* Price */}
          <div className="mb-5">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Price
            </label>

            <div className="relative">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter your service price"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

          </div>


          {/* Experience */}
          <div className="mb-5">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience
            </label>

            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              placeholder="Years of experience"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>


          {/* Service Area */}
          <div className="mb-5">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Area
            </label>

            <input
              type="text"
              name="service_area"
              value={formData.service_area}
              onChange={handleChange}
              placeholder="e.g. Ahmedabad"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>


          {/* Image */}
          <div className="mb-6">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Image
            </label>

            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">

              <Upload
                size={28}
                className="text-gray-400 mb-2"
              />

              <span className="text-sm text-gray-500">
                {formData.service_image
                  ? formData.service_image.name
                  : "Click to upload image"}
              </span>

              <input
                type="file"
                name="service_image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />

            </label>

            <p className="text-xs text-gray-400 mt-2">
              JPG, JPEG, PNG or WEBP. Maximum 2MB.
            </p>

          </div>


          {/* Status */}
          <div className="mb-7">

            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 cursor-pointer">

              <div>
                <p className="font-semibold text-gray-800">
                  Service Status
                </p>

                <p className="text-sm text-gray-500">
                  Customers can see your service when active.
                </p>
              </div>

              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 accent-blue-600"
              />

            </label>

          </div>


          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">

            <button
              type="button"
              onClick={() =>
                navigate("/provider/services")
              }
              className="flex-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingServices}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Service
                </>
              )}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AddService;