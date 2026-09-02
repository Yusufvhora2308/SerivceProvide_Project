// PATH: src/Pages/Provider/EditService.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";

import api from "../../api/axios";

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New image preview
  const [newImagePreview, setNewImagePreview] = useState("");

  // Old image failed
  const [oldImageError, setOldImageError] = useState(false);

  const [formData, setFormData] = useState({
    price: "",
    experience: "",
    service_area: "",
    service_image: null,
    is_active: true,
  });

  // =====================================================
  // API BASE URL
  // =====================================================

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api";

  // Remove /api from URL for Laravel storage
  const STORAGE_BASE_URL = API_BASE_URL.replace(
    /\/api\/?$/,
    ""
  );

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    const imageString = String(image).trim();

    if (!imageString) return "";

    // ---------------------------------------------------
    // 1. Already full URL
    // ---------------------------------------------------

    if (
      imageString.startsWith("http://") ||
      imageString.startsWith("https://")
    ) {
      return imageString;
    }

    // ---------------------------------------------------
    // 2. Remove starting slash
    // ---------------------------------------------------

    let cleanImage = imageString.replace(/^\/+/, "");

    // ---------------------------------------------------
    // 3. If backend returns storage/...
    // ---------------------------------------------------

    if (cleanImage.startsWith("storage/")) {
      return `${STORAGE_BASE_URL}/${cleanImage}`;
    }

    // ---------------------------------------------------
    // 4. If backend returns public/storage/...
    // ---------------------------------------------------

    if (cleanImage.startsWith("public/storage/")) {
      cleanImage = cleanImage.replace(
        "public/storage/",
        "storage/"
      );

      return `${STORAGE_BASE_URL}/${cleanImage}`;
    }

    // ---------------------------------------------------
    // 5. If backend returns /api/storage/...
    // ---------------------------------------------------

    if (cleanImage.startsWith("api/storage/")) {
      cleanImage = cleanImage.replace(
        "api/",
        ""
      );

      return `${STORAGE_BASE_URL}/${cleanImage}`;
    }

    // ---------------------------------------------------
    // 6. Normal Laravel storage path
    //
    // Example:
    // services/abc.jpg
    // service_images/abc.jpg
    // ---------------------------------------------------

    return `${STORAGE_BASE_URL}/storage/${cleanImage}`;
  };

  // =====================================================
  // FETCH SERVICE
  // =====================================================

  useEffect(() => {
    fetchService();

    return () => {
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
      }
    };
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError("");
      setOldImageError(false);

      const response = await api.get(
        `/provider/services/${id}`
      );

      console.log(
        "EDIT SERVICE API RESPONSE:",
        response.data
      );

      const data = response.data?.service;

      if (!data) {
        setService(null);
        setError("Service data not found.");
        return;
      }

      console.log(
        "SERVICE IMAGE FROM API:",
        data.service_image
      );

      console.log(
        "GENERATED IMAGE URL:",
        getImageUrl(data.service_image)
      );

      setService(data);

      setFormData({
        price: data.price ?? "",
        experience: data.experience ?? "",
        service_area: data.service_area ?? "",
        service_image: null,
        is_active:
          Boolean(data.is_active),
      });
    } catch (error) {
      console.error(
        "Fetch service error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load service."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = e.target;

    // ---------------------------------------------------
    // FILE
    // ---------------------------------------------------

    if (type === "file") {
      const file = files?.[0];

      if (!file) {
        return;
      }

      // File type validation
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(
          "Please select JPG, JPEG, PNG or WEBP image."
        );

        e.target.value = "";
        return;
      }

      // 2 MB validation
      if (file.size > 2 * 1024 * 1024) {
        setError(
          "Image size must be less than 2 MB."
        );

        e.target.value = "";
        return;
      }

      setError("");

      // Revoke previous preview
      if (newImagePreview) {
        URL.revokeObjectURL(
          newImagePreview
        );
      }

      // Create preview
      const previewUrl =
        URL.createObjectURL(file);

      setNewImagePreview(previewUrl);

      setFormData((prev) => ({
        ...prev,
        service_image: file,
      }));

      return;
    }

    // ---------------------------------------------------
    // CHECKBOX / NORMAL INPUT
    // ---------------------------------------------------

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // REMOVE NEW IMAGE
  // =====================================================

  const removeNewImage = () => {
    if (newImagePreview) {
      URL.revokeObjectURL(
        newImagePreview
      );
    }

    setNewImagePreview("");

    setFormData((prev) => ({
      ...prev,
      service_image: null,
    }));
  };

  // =====================================================
  // UPDATE SERVICE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setSubmitting(true);

      const data = new FormData();

      data.append(
        "price",
        formData.price
      );

      data.append(
        "experience",
        formData.experience
      );

      data.append(
        "service_area",
        formData.service_area
      );

      data.append(
        "is_active",
        formData.is_active
          ? "1"
          : "0"
      );

      // New image only
      if (formData.service_image) {
        data.append(
          "service_image",
          formData.service_image
        );
      }

      // Laravel PUT method spoofing
      data.append(
        "_method",
        "PUT"
      );

      const response =
        await api.post(
          `/provider/services/${id}`,
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      console.log(
        "UPDATE SERVICE RESPONSE:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Service updated successfully."
      );

      // Navigate after success
      setTimeout(() => {
        navigate(
          "/provider/services"
        );
      }, 800);
    } catch (error) {
      console.error(
        "Update service error:",
        error
      );

      if (
        error.response?.data
          ?.errors
      ) {
        const validationErrors =
          error.response.data
            .errors;

        const firstError =
          Object.values(
            validationErrors
          )?.[0]?.[0];

        setError(
          firstError ||
            "Please check the form."
        );
      } else {
        setError(
          error.response?.data
            ?.message ||
            "Unable to update service."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            size={24}
            className="animate-spin"
          />

          <span>
            Loading service...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // SERVICE NOT FOUND
  // =====================================================

  if (!service) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">

          <p className="text-gray-600 mb-4">
            {error ||
              "Service not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/provider/services"
              )
            }
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Back to My Services
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // CURRENT IMAGE URL
  // =====================================================

  const currentImageUrl =
    getImageUrl(
      service.service_image
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-3xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center gap-3 mb-6">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/provider/services"
              )
            }
            className="p-2 rounded-lg hover:bg-white transition"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Edit Service
            </h1>

            <p className="text-gray-500 mt-1">
              Update your service information.
            </p>
          </div>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-7"
        >

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
              {success}
            </div>
          )}

          {/* =================================================
              SERVICE INFORMATION
          ================================================= */}

          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">

            <p className="text-sm text-blue-600 font-semibold">
              {service.service?.category ||
                "General"}
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-1">
              {service.service?.name ||
                "Service"}
            </h2>

            {service.service
              ?.description && (
              <p className="text-sm text-gray-600 mt-2">
                {
                  service.service
                    .description
                }
              </p>
            )}

          </div>

          {/* =================================================
              PRICE
          ================================================= */}

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
                required
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* =================================================
              EXPERIENCE
          ================================================= */}

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
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Years of experience"
            />

          </div>

          {/* =================================================
              SERVICE AREA
          ================================================= */}

          <div className="mb-5">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Area
            </label>

            <input
              type="text"
              name="service_area"
              value={
                formData.service_area
              }
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Example: Ahmedabad, Gandhinagar"
            />

          </div>

          {/* =================================================
              OLD / CURRENT IMAGE
          ================================================= */}

          <div className="mb-6">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Service Image
            </label>

            {currentImageUrl &&
            !oldImageError ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">

                <img
                  src={currentImageUrl}
                  alt={
                    service.service?.name ||
                    "Service"
                  }
                  className="w-full h-64 object-cover"
                  onLoad={() => {
                    console.log(
                      "OLD IMAGE LOADED:",
                      currentImageUrl
                    );
                  }}
                  onError={() => {
                    console.error(
                      "OLD IMAGE FAILED:",
                      currentImageUrl
                    );

                    setOldImageError(
                      true
                    );
                  }}
                />

                {/* CURRENT IMAGE BADGE */}

                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
                  <ImageIcon size={14} />
                  Current Image
                </div>

              </div>
            ) : (
              <div className="w-full h-64 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">

                <ImageIcon
                  size={48}
                />

                <p className="mt-3 text-sm font-medium">
                  Current image not available
                </p>

                {currentImageUrl && (
                  <p className="text-xs mt-2 px-4 text-center break-all">
                    {currentImageUrl}
                  </p>
                )}

              </div>
            )}

            {/* Debug information */}

            {service.service_image && (
              <p className="text-xs text-gray-400 mt-2 break-all">
                Image path:{" "}
                {service.service_image}
              </p>
            )}

          </div>

          {/* =================================================
              CHANGE IMAGE
          ================================================= */}

          <div className="mb-6">

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Change Service Image
            </label>

            <label className="flex flex-col items-center justify-center w-full min-h-32 px-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">

              <Upload
                size={28}
                className="text-gray-400 mb-2"
              />

              <span className="text-sm text-gray-600 text-center font-medium">
                {formData.service_image
                  ? formData
                      .service_image
                      .name
                  : "Choose new service image"}
              </span>

              <span className="text-xs text-gray-400 mt-1">
                JPG, JPEG, PNG or WEBP • Max 2 MB
              </span>

              <input
                type="file"
                name="service_image"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleChange}
                className="hidden"
              />

            </label>

            {/* =================================================
                NEW IMAGE PREVIEW
            ================================================= */}

            {newImagePreview && (
              <div className="mt-5">

                <div className="flex items-center justify-between mb-2">

                  <p className="text-sm font-semibold text-gray-700">
                    New Image Preview
                  </p>

                  <button
                    type="button"
                    onClick={
                      removeNewImage
                    }
                    className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                    Remove
                  </button>

                </div>

                <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-gray-100">

                  <img
                    src={newImagePreview}
                    alt="New service preview"
                    className="w-full h-64 object-cover"
                  />

                  {/* NEW IMAGE BADGE */}

                  <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
                    <ImageIcon
                      size={14}
                    />
                    New Image
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              STATUS
          ================================================= */}

          <div className="mb-7">

            <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200">

              <div>

                <p className="font-semibold text-gray-800">
                  Service Status
                </p>

                <p className="text-sm text-gray-500">
                  Active services are visible to customers.
                </p>

              </div>

              <input
                type="checkbox"
                name="is_active"
                checked={
                  formData.is_active
                }
                onChange={handleChange}
                className="w-5 h-5 accent-blue-600"
              />

            </label>

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex flex-col sm:flex-row gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/provider/services"
                )
              }
              disabled={submitting}
              className="flex-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >

              {submitting ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Updating...
                </>
              ) : (
                <>
                  <Save
                    size={20}
                  />

                  Update Service
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default EditService;
