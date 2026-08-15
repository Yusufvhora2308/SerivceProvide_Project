import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const MyRequests = () => {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get("/service-requests");

            setRequests(response.data.data);
        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                "Unable to load your service requests."
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500">
                    Loading your requests...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">

            <div className="mx-auto max-w-5xl">

                {/* Header */}

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Service Requests
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Track your current and previous service requests.
                    </p>
                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {/* Empty State */}

                {!error && requests.length === 0 && (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                        <div className="mb-4 text-5xl">
                            🔧
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900">
                            No service requests yet
                        </h2>

                        <p className="mt-2 text-gray-500">
                            When you request a service,
                            it will appear here.
                        </p>

                        <button
                            onClick={() => navigate("/dashboard")}
                            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            Browse Services
                        </button>

                    </div>
                )}

                {/* Request List */}

                <div className="space-y-5">

                    {requests.map((request) => (

                        <div
                            key={request.id}
                            className="rounded-2xl bg-white p-6 shadow-sm"
                        >

                            <div className="flex flex-col justify-between gap-4 sm:flex-row">

                                {/* Service */}

                                <div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        {request.service?.name}
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {request.service?.category}
                                    </p>

                                </div>

                                {/* Status */}

                                <span
                                    className={`h-fit rounded-full px-4 py-2 text-sm font-medium ${getStatusStyle(
                                        request.status
                                    )}`}
                                >
                                    {formatStatus(request.status)}
                                </span>

                            </div>

                            {/* Details */}

                            <div className="mt-5 grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2">

                                <div>
                                    <p className="text-xs text-gray-400">
                                        SERVICE LOCATION
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        📍 {request.address}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        REQUEST TYPE
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        {request.request_type === "now"
                                            ? "⚡ Immediate Service"
                                            : "📅 Scheduled Service"}
                                    </p>
                                </div>

                            </div>

                            {/* Problem */}

                            {request.problem_description && (
                                <div className="mt-5">

                                    <p className="text-xs text-gray-400">
                                        PROBLEM
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        {request.problem_description}
                                    </p>

                                </div>
                            )}

                            {/* Action */}

                            <div className="mt-6 border-t pt-5">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/customer/service-requests/${request.id}`
                                        )
                                    }
                                    className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                                >
                                    View Request
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
};

export default MyRequests;