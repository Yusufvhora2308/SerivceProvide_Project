import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const RequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        try {
            const response = await api.get(
                `/service-requests/${id}`
            );

            setRequest(response.data.data);
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Unable to load service request."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatStatus = (status) => {
        return status
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "searching":
                return "bg-yellow-100 text-yellow-700";

            case "provider_assigned":
                return "bg-blue-100 text-blue-700";

            case "provider_on_the_way":
                return "bg-purple-100 text-purple-700";

            case "arrived":
                return "bg-indigo-100 text-indigo-700";

            case "service_started":
                return "bg-orange-100 text-orange-700";

            case "service_completed":
                return "bg-green-100 text-green-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">
                    Loading request...
                </p>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">

                <p className="text-red-500">
                    {error || "Request not found."}
                </p>

                <button
                    onClick={() =>
                        navigate("/customer/requests")
                    }
                    className="mt-4 rounded-xl bg-gray-900 px-5 py-2 text-white"
                >
                    Back to Requests
                </button>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">

            <div className="mx-auto max-w-3xl">

                {/* Back */}

                <button
                    onClick={() =>
                        navigate("/customer/requests")
                    }
                    className="mb-6 text-sm text-gray-600 hover:text-gray-900"
                >
                    ← Back to My Requests
                </button>

                {/* Main Card */}

                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

                    {/* Header */}

                    <div className="flex flex-col justify-between gap-4 sm:flex-row">

                        <div>

                            <p className="text-sm text-gray-500">
                                Service Request #{request.id}
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-gray-900">
                                {request.service?.name}
                            </h1>

                        </div>

                        <span
                            className={`h-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
                                request.status
                            )}`}
                        >
                            {formatStatus(request.status)}
                        </span>

                    </div>

                    {/* Searching Status */}

                    {request.status === "searching" && (
                        <div className="mt-8 rounded-2xl bg-yellow-50 p-8 text-center">

                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl">
                                🔍
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">
                                Finding a Service Provider
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
                                We're searching for nearby available
                                providers for your service request.
                            </p>

                        </div>
                    )}

                    {/* Location */}

                    <div className="mt-8 border-t pt-6">

                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                            Service Location
                        </h2>

                        <p className="mt-2 text-gray-700">
                            📍 {request.address}
                        </p>

                    </div>

                    {/* Problem */}

                    {request.problem_description && (
                        <div className="mt-6">

                            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                                Problem Description
                            </h2>

                            <p className="mt-2 text-gray-700">
                                {request.problem_description}
                            </p>

                        </div>
                    )}

                    {/* Request Type */}

                    <div className="mt-6">

                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                            Service Time
                        </h2>

                        <p className="mt-2 text-gray-700">
                            {request.request_type === "now"
                                ? "⚡ Immediate Service"
                                : `📅 ${request.scheduled_at}`}
                        </p>

                    </div>

                    {/* Cancel */}

                    {[
                        "searching",
                        "provider_assigned",
                        "provider_on_the_way"
                    ].includes(request.status) && (

                        <div className="mt-8 border-t pt-6">

                            <button
                                className="w-full rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 hover:bg-red-50"
                            >
                                Cancel Request
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default RequestDetails;