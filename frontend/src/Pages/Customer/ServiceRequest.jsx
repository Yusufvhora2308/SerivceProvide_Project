import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

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
            const response = await api.get(`/services/${serviceId}`);

            setService(response.data.data);
        } catch (error) {
            console.error(error);
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
            const response = await api.post("/service-requests", {
                service_id: serviceId,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
                problem_description: formData.problem_description,
                request_type: formData.request_type,
                scheduled_at:
                    formData.request_type === "scheduled"
                        ? formData.scheduled_at
                        : null,
            });

            console.log(response.data);

            alert("Service request created successfully!");

            navigate("/customer/dashboard");

        } catch (error) {
            console.error(error);

            if (error.response?.data?.errors) {
                setError(
                    Object.values(error.response.data.errors)
                        .flat()
                        .join(" ")
                );
            } else {
                setError("Unable to create service request.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">
                    {error || "Service not found."}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">

            <div className="mx-auto max-w-2xl">

                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back
                </button>

                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

                    <div className="mb-8">

                        <p className="text-sm text-gray-500">
                            Requesting service
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            {service.name}
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Starting from ₹{service.base_price}
                        </p>

                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Address */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Service Address
                            </label>

                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your complete address"
                                rows="3"
                                required
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Coordinates */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Latitude
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    placeholder="23.0225"
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Longitude
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    placeholder="72.5714"
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                        </div>

                        {/* Problem */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Describe Your Problem
                            </label>

                            <textarea
                                name="problem_description"
                                value={formData.problem_description}
                                onChange={handleChange}
                                placeholder="Example: AC is running but not cooling."
                                rows="4"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Request Type */}

                        <div>

                            <label className="mb-3 block text-sm font-medium text-gray-700">
                                When do you need the service?
                            </label>

                            <div className="grid grid-cols-2 gap-4">

                                <label
                                    className={`cursor-pointer rounded-xl border p-4 ${
                                        formData.request_type === "now"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200"
                                    }`}
                                >

                                    <input
                                        type="radio"
                                        name="request_type"
                                        value="now"
                                        checked={
                                            formData.request_type === "now"
                                        }
                                        onChange={handleChange}
                                        className="mr-2"
                                    />

                                    <span className="font-medium">
                                        Now
                                    </span>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Find a provider immediately
                                    </p>

                                </label>

                                <label
                                    className={`cursor-pointer rounded-xl border p-4 ${
                                        formData.request_type === "scheduled"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200"
                                    }`}
                                >

                                    <input
                                        type="radio"
                                        name="request_type"
                                        value="scheduled"
                                        checked={
                                            formData.request_type === "scheduled"
                                        }
                                        onChange={handleChange}
                                        className="mr-2"
                                    />

                                    <span className="font-medium">
                                        Schedule
                                    </span>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Choose a future time
                                    </p>

                                </label>

                            </div>

                        </div>

                        {/* Schedule */}

                        {formData.request_type === "scheduled" && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Select Date & Time
                                </label>

                                <input
                                    type="datetime-local"
                                    name="scheduled_at"
                                    value={formData.scheduled_at}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting
                                ? "Creating Request..."
                                : "Request Service"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
};

export default ServiceRequest;