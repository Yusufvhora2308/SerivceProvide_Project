import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    RefreshCw,
    MapPin,
    Calendar,
    Clock,
    User,
    Wrench,
    XCircle,
    CheckCircle,
    Loader2,
} from "lucide-react";
import api from "../../api/axios";

const MyRequests = () => {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    // ==========================================
    // FETCH CUSTOMER REQUESTS
    // ==========================================

    const fetchRequests = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                "/customer/service-requests"
            );

            console.log(
                "My Requests Response:",
                response.data
            );

            setRequests(
                response.data.service_requests || []
            );

        } catch (error) {
            console.error(
                "Fetch Requests Error:",
                error
            );

            if (error.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                    "Unable to load your service requests."
                );
            }

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // ==========================================
    // CANCEL REQUEST
    // ==========================================

    const handleCancel = async (requestId) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this service request?"
        );

        if (!confirmCancel) {
            return;
        }

        try {
            setCancellingId(requestId);

            await api.post(
                `/customer/service-requests/${requestId}/cancel`
            );

            // Refresh list after cancellation
            await fetchRequests(true);

        } catch (error) {
            console.error(
                "Cancel Request Error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to cancel this request."
            );

        } finally {
            setCancellingId(null);
        }
    };

    // ==========================================
    // STATUS STYLE
    // ==========================================

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

    // ==========================================
    // STATUS ICON
    // ==========================================

    const getStatusIcon = (status) => {
        switch (status) {
            case "searching":
                return "🔍";

            case "provider_assigned":
                return "👨‍🔧";

            case "provider_on_the_way":
                return "🚗";

            case "arrived":
                return "📍";

            case "service_started":
                return "🔧";

            case "service_completed":
                return "✅";

            case "cancelled":
                return "❌";

            default:
                return "📋";
        }
    };

    // ==========================================
    // FORMAT STATUS
    // ==========================================

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        return status
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "Not scheduled";
        }

        try {
            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        } catch {
            return date;
        }
    };

    // ==========================================
    // FORMAT TIME
    // ==========================================

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        try {
            return new Date(date).toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        } catch {
            return "";
        }
    };

    // ==========================================
    // CAN CANCEL
    // ==========================================

    const canCancel = (status) => {
        return [
            "searching",
            "provider_assigned",
            "provider_on_the_way",
            "arrived",
        ].includes(status);
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

                    <p className="text-gray-500">
                        Loading your requests...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">

            <div className="mx-auto max-w-5xl">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Service Requests
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Track your current and previous service requests.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchRequests(true)}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>

                {/* ==========================================
                    ERROR
                ========================================== */}

                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">

                        <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5" />

                            <span>
                                {error}
                            </span>
                        </div>

                        <button
                            onClick={() =>
                                fetchRequests(true)
                            }
                            className="text-sm font-semibold underline"
                        >
                            Retry
                        </button>

                    </div>
                )}

                {/* ==========================================
                    EMPTY STATE
                ========================================== */}

                {!error && requests.length === 0 && (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                            <Wrench className="h-10 w-10 text-blue-600" />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900">
                            No service requests yet
                        </h2>

                        <p className="mt-2 text-gray-500">
                            When you request a service,
                            it will appear here.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/dashboard")
                            }
                            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Browse Services
                        </button>

                    </div>
                )}

                {/* ==========================================
                    REQUEST LIST
                ========================================== */}

                <div className="space-y-5">

                    {requests.map((request) => (

                        <div
                            key={request.id}
                            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >

                            {/* ==================================
                                TOP SECTION
                            ================================== */}

                            <div className="flex flex-col justify-between gap-4 sm:flex-row">

                                <div>

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                            <Wrench className="h-5 w-5 text-blue-600" />
                                        </div>

                                        <div>

                                            <h2 className="text-xl font-bold text-gray-900">
                                                {request.service?.name ||
                                                    "Service"}
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                {request.service?.category ||
                                                    "Service Request"}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* STATUS */}

                                <span
                                    className={`flex h-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${getStatusStyle(
                                        request.status
                                    )}`}
                                >
                                    <span>
                                        {getStatusIcon(
                                            request.status
                                        )}
                                    </span>

                                    {formatStatus(
                                        request.status
                                    )}
                                </span>

                            </div>

                            {/* ==================================
                                PROVIDER
                            ================================== */}

                            {request.provider && (
                                <div className="mt-5 rounded-xl bg-gray-50 p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                                            <User className="h-5 w-5 text-gray-600" />
                                        </div>

                                        <div>

                                            <p className="text-xs font-medium uppercase text-gray-400">
                                                Provider
                                            </p>

                                            <p className="mt-0.5 font-semibold text-gray-800">
                                                {request.provider?.name ||
                                                    request.provider?.user?.name ||
                                                    "Provider Assigned"}
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* ==================================
                                DETAILS
                            ================================== */}

                            <div className="mt-5 grid grid-cols-1 gap-5 border-t pt-5 sm:grid-cols-2">

                                {/* LOCATION */}

                                <div className="flex gap-3">

                                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                                    <div>
                                        <p className="text-xs font-medium uppercase text-gray-400">
                                            Service Location
                                        </p>

                                        <p className="mt-1 text-sm text-gray-700">
                                            {request.address}
                                        </p>
                                    </div>

                                </div>

                                {/* REQUEST TYPE */}

                                <div className="flex gap-3">

                                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />

                                    <div>

                                        <p className="text-xs font-medium uppercase text-gray-400">
                                            Request Type
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                            {request.request_type === "now"
                                                ? "⚡ Now"
                                                : "📅 Scheduled"}
                                        </p>

                                    </div>

                                </div>

                                {/* SCHEDULED DATE */}

                                {request.request_type === "scheduled" &&
                                    request.scheduled_at && (
                                        <div className="flex gap-3">

                                            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />

                                            <div>

                                                <p className="text-xs font-medium uppercase text-gray-400">
                                                    Scheduled For
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-700">
                                                    {formatDate(
                                                        request.scheduled_at
                                                    )}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {formatTime(
                                                        request.scheduled_at
                                                    )}
                                                </p>

                                            </div>

                                        </div>
                                    )}

                                {/* CREATED DATE */}

                                <div className="flex gap-3">

                                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                                    <div>

                                        <p className="text-xs font-medium uppercase text-gray-400">
                                            Request Created
                                        </p>

                                        <p className="mt-1 text-sm text-gray-700">
                                            {formatDate(
                                                request.created_at
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* ==================================
                                PROBLEM
                            ================================== */}

                            {request.problem_description && (
                                <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">

                                    <p className="text-xs font-medium uppercase text-gray-400">
                                        Problem Description
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-gray-700">
                                        {request.problem_description}
                                    </p>

                                </div>
                            )}

                            {/* ==================================
                                ACTIONS
                            ================================== */}

                            <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/customer/service-requests/${request.id}`
                                        )
                                    }
                                    className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    View Request
                                </button>

                                {canCancel(request.status) && (
                                    <button
                                        onClick={() =>
                                            handleCancel(
                                                request.id
                                            )
                                        }
                                        disabled={
                                            cancellingId ===
                                            request.id
                                        }
                                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {cancellingId ===
                                        request.id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Cancelling...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-4 w-4" />
                                                Cancel Request
                                            </>
                                        )}
                                    </button>
                                )}

                                {request.status ===
                                    "service_completed" && (
                                    <div className="flex items-center gap-2 rounded-xl bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700">
                                        <CheckCircle className="h-4 w-4" />
                                        Service Completed
                                    </div>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
};

export default MyRequests;

