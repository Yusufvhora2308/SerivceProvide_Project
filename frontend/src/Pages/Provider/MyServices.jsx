// PATH: src/Pages/Provider/MyServices.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  BriefcaseBusiness,
  IndianRupee,
  Loader2,
  Wrench,
  AlertCircle,
} from "lucide-react";

import api from "../../api/axios";

const MyServices = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Provider Services
  |--------------------------------------------------------------------------
  */

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/provider/services");

      setServices(response.data.services || []);
    } catch (error) {
      console.error("Fetch services error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your services."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Delete Service
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      await api.delete(`/provider/services/${id}`);

      setServices((prev) =>
        prev.filter((service) => service.id !== id)
      );
    } catch (error) {
      console.error("Delete service error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete service."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Image URL
  |--------------------------------------------------------------------------
  */

  const getImageUrl = (image) => {
    if (!image) return null;

    if (image.startsWith("http")) {
      return image;
    }

    return `${import.meta.env.VITE_API_BASE_URL}/storage/${image}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Format Price
  |--------------------------------------------------------------------------
  */

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "0.00";
    }

    return Number(price).toFixed(2);
  };

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading services...</span>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Services
            </h1>

            <p className="text-gray-500 mt-1">
              Manage the services you provide to customers.
            </p>
          </div>

          <button
            onClick={() => navigate("/provider/services/add")}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add New Service
          </button>

        </div>


        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}


        {/* Empty State */}
        {!error && services.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">

            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              No Services Added
            </h2>

            <p className="text-gray-500 mt-2 mb-6">
              Add your first service so customers can find you.
            </p>

            <button
              onClick={() => navigate("/provider/services/add")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Service
            </button>

          </div>
        )}


        {/* Services Grid */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {services.map((item) => {

              const service = item.service;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"
                >

                  {/* Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">

                    {item.service_image ? (
                      <img
                        src={getImageUrl(item.service_image)}
                        alt={service?.name || "Service"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Wrench size={42} />

                        <span className="text-sm mt-2">
                          No Image
                        </span>
                      </div>
                    )}

                  </div>


                  {/* Content */}
                  <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {service?.name || "Service"}
                        </h2>

                        <p className="text-sm text-blue-600 font-medium mt-1">
                          {service?.category || "General"}
                        </p>
                      </div>


                      {/* Status */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          item.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>

                    </div>


                    {/* Description */}
                    {service?.description && (
                      <p className="text-sm text-gray-500 mt-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}


                    {/* Details */}
                    <div className="mt-5 space-y-3">

                      {/* Basic Price */}
                      <div className="flex items-center gap-3 text-gray-700">
                        <IndianRupee
                          size={18}
                          className="text-green-600"
                        />

                        <span className="text-sm text-gray-500">
                          Basic Visit Price:
                        </span>

                        <span className="font-semibold text-gray-900">
                          ₹{formatPrice(item.price)}
                        </span>
                      </div>


                      {/* Experience */}
                      <div className="flex items-center gap-3 text-gray-600">
                        <BriefcaseBusiness
                          size={18}
                          className="text-blue-600"
                        />

                        <span>
                          {item.experience || 0} years experience
                        </span>
                      </div>


                      {/* Service Area */}
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin
                          size={18}
                          className="text-red-500"
                        />

                        <span>
                          {item.service_area || "Service area not specified"}
                        </span>
                      </div>

                    </div>


                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">

                      <button
                        onClick={() =>
                          navigate(
                            `/provider/services/edit/${item.id}`
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-medium hover:bg-blue-50 transition"
                      >
                        <Pencil size={17} />
                        Edit
                      </button>


                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteLoading === item.id}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {deleteLoading === item.id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}

                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default MyServices;

