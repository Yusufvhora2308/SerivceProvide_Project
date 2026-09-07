import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    RefreshCw,
    MapPin,
    Calendar,
    Clock,
    User,
    Wrench,
    XCircle,
    CheckCircle,
    Search,
    Car,
    Navigation,
    PlayCircle,
    Loader2,
    AlertCircle,
} from "lucide-react";
import api from "../../api/axios";

const RequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // ==========================================
    // STATUS FLOW
    // ==========================================

    const statusSteps = [
        {
            status: "searching",
            label: "Searching",
            description: "Finding a nearby service provider",
            icon: Search,
        },
        {
            status: "provider_assigned",
            label: "Provider Assigned",
            description: "A service provider has accepted your request",
            icon: User,
        },
        {
            status: "provider_on_the_way",
            label: "Provider On The Way",
            description: "Your provider is coming to your location",
            icon: Car,
        },
        {
            status: "arrived",
            label: "Provider Arrived",
            description: "Provider has arrived at your location",
            icon: Navigation,
        },
        {
            status: "service_started",
            label: "Service Started",
            description: "Your service is currently in progress",
            icon: PlayCircle,
        },
        {
            status: "service_completed",
            label: "Service Completed",
            description: "Your service has been completed",
            icon: CheckCircle,
        },
    ];

    // ==========================================
    // FETCH REQUEST
    // ==========================================

    const fetchRequest = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get(
                `/customer/service-requests/${id}`
            );

            console.log(
                "Request Details Response:",
                response.data
            );

            setRequest(
                response.data.service_request || null
            );

        } catch (error) {
            console.error(
                "Fetch Request Error:",
                error
            );

            if (error.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                    "Unable to load service request."
                );
            }

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [id]);

    // ==========================================
    // AUTO REFRESH
    // ==========================================

    useEffect(() => {
        if (!request) {
            return;
        }

        if (
            [
                "service_completed",
                "cancelled",
            ].includes(request.status)
        ) {
            return;
        }

        const interval = setInterval(() => {
            fetchRequest(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [request?.status, id]);

    // ==========================================
    // CANCEL REQUEST
    // ==========================================

    const handleCancel = async () => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this service request?"
        );

        if (!confirmCancel) {
            return;
        }

        try {
            setCancelling(true);

            const response = await api.post(
                `/customer/service-requests/${id}/cancel`
            );

            console.log(
                "Cancel Response:",
                response.data
            );

            setRequest(
                response.data.service_request
            );

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
            setCancelling(false);
        }
    };

    // ==========================================
    // STATUS INDEX
    // ==========================================

    const getStatusIndex = (status) => {
        return statusSteps.findIndex(
            (step) => step.status === status
        );
    };

    // ==========================================
    // STATUS COLOR
    // ==========================================

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
            return "Not available";
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
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">

                <div className="flex flex-col items-center gap-3">

                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

                    <p className="text-gray-500">
                        Loading request...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error || !request) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">

                <AlertCircle className="mb-4 h-12 w-12 text-red-500" />

                <p className="text-center text-red-500">
                    {error || "Request not found."}
                </p>

                <button
                    onClick={() =>
                        navigate(
                            "/customer/my-requests"
                        )
                    }
                    className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 font-semibold text-white hover:bg-gray-800"
                >
                    Back to Requests
                </button>

            </div>
        );
    }

    const currentStatusIndex =
        getStatusIndex(request.status);

    const isCancelled =
        request.status === "cancelled";

    const isCompleted =
        request.status === "service_completed";

    const canCancel =
        [
            "searching",
            "provider_assigned",
            "provider_on_the_way",
            "arrived",
        ].includes(request.status);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">

            <div className="mx-auto max-w-4xl">

                {/* ==========================================
                    BACK + REFRESH
                ========================================== */}

                <div className="mb-6 flex items-center justify-between">

                    <button
                        onClick={() =>
                            navigate(
                                "/customer/my-requests"
                            )
                        }
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Requests
                    </button>

                    <button
                        onClick={() =>
                            fetchRequest(true)
                        }
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        Refresh
                    </button>

                </div>

                {/* ==========================================
                    MAIN CARD
                ========================================== */}

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">

                    {/* ======================================
                        HEADER
                    ====================================== */}

                    <div className="flex flex-col justify-between gap-4 sm:flex-row">

                        <div>

                            <p className="text-sm font-medium text-gray-400">
                                Service Request #{request.id}
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-gray-900">
                                {request.service?.name ||
                                    "Service Request"}
                            </h1>

                            {request.service?.category && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {request.service.category}
                                </p>
                            )}

                        </div>

                        <span
                            className={`flex h-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
                                request.status
                            )}`}
                        >
                            {formatStatus(
                                request.status
                            )}
                        </span>

                    </div>

                    {/* ======================================
                        CANCELLED MESSAGE
                    ====================================== */}

                    {isCancelled && (
                        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">

                            <div className="flex items-start gap-4">

                                <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />

                                <div>

                                    <h2 className="font-bold text-red-800">
                                        Request Cancelled
                                    </h2>

                                    <p className="mt-1 text-sm text-red-700">
                                        This service request has
                                        been cancelled.
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* ======================================
                        COMPLETED MESSAGE
                    ====================================== */}

                    {isCompleted && (
                        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6">

                            <div className="flex items-start gap-4">

                                <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />

                                <div>

                                    <h2 className="font-bold text-green-800">
                                        Service Completed
                                    </h2>

                                    <p className="mt-1 text-sm text-green-700">
                                        Your service request has
                                        been successfully completed.
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* ======================================
                        STATUS TIMELINE
                    ====================================== */}

                    {!isCancelled && (
                        <div className="mt-8 rounded-2xl bg-gray-50 p-5 md:p-6">

                            <div className="mb-6">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Request Progress
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Track the current status of
                                    your service request.
                                </p>

                            </div>

                            <div className="space-y-6">

                                {statusSteps.map(
                                    (
                                        step,
                                        index
                                    ) => {

                                        const Icon =
                                            step.icon;

                                        const completed =
                                            currentStatusIndex >=
                                            index;

                                        const current =
                                            request.status ===
                                            step.status;

                                        return (
                                            <div
                                                key={
                                                    step.status
                                                }
                                                className="flex gap-4"
                                            >

                                                {/* ICON */}

                                                <div className="flex flex-col items-center">

                                                    <div
                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                                            completed
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-gray-200 text-gray-400"
                                                        } ${
                                                            current
                                                                ? "ring-4 ring-blue-100"
                                                                : ""
                                                        }`}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>

                                                    {index <
                                                        statusSteps.length -
                                                            1 && (
                                                        <div
                                                            className={`mt-2 h-8 w-0.5 ${
                                                                currentStatusIndex >
                                                                index
                                                                    ? "bg-blue-600"
                                                                    : "bg-gray-200"
                                                            }`}
                                                        />
                                                    )}

                                                </div>

                                                {/* TEXT */}

                                                <div className="pt-1">

                                                    <p
                                                        className={`font-semibold ${
                                                            current
                                                                ? "text-blue-700"
                                                                : completed
                                                                ? "text-gray-900"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {
                                                            step.label
                                                        }

                                                        {current && (
                                                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                                                Current
                                                            </span>
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {
                                                            step.description
                                                        }
                                                    </p>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>
                    )}

                    {/* ======================================
                        PROVIDER
                    ====================================== */}

                    {request.provider && (
                        <div className="mt-8 border-t pt-6">

                            <h2 className="mb-4 text-lg font-bold text-gray-900">
                                Service Provider
                            </h2>

                            <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-5">

                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                                    <User className="h-7 w-7 text-blue-600" />
                                </div>

                                <div>

                                    <p className="text-xs font-medium uppercase text-gray-400">
                                        Provider
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-gray-900">
                                        {request.provider?.name ||
                                            request.provider?.user?.name ||
                                            "Assigned Provider"}
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* ======================================
                        SERVICE DETAILS
                    ====================================== */}

                    <div className="mt-8 border-t pt-6">

                        <h2 className="mb-5 text-lg font-bold text-gray-900">
                            Service Details
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* LOCATION */}

                            <div className="flex gap-3">

                                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                                <div>

                                    <p className="text-xs font-medium uppercase text-gray-400">
                                        Service Location
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-gray-700">
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
                                        {request.request_type ===
                                        "now"
                                            ? "⚡ Immediate Service"
                                            : "📅 Scheduled Service"}
                                    </p>

                                </div>

                            </div>

                            {/* SCHEDULED */}

                            {request.request_type ===
                                "scheduled" &&
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

                            {/* CREATED */}

                            <div className="flex gap-3">

                                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                                <div>

                                    <p className="text-xs font-medium uppercase text-gray-400">
                                        Created
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        {formatDate(
                                            request.created_at
                                        )}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* ======================================
                        PROBLEM DESCRIPTION
                    ====================================== */}

                    {request.problem_description && (
                        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">

                            <div className="flex items-start gap-3">

                                <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />

                                <div>

                                    <p className="text-xs font-medium uppercase text-gray-400">
                                        Problem Description
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-gray-700">
                                        {
                                            request.problem_description
                                        }
                                    </p>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* ======================================
                        CANCEL
                    ====================================== */}

                    {canCancel && (
                        <div className="mt-8 border-t pt-6">

                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {cancelling ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-5 w-5" />
                                        Cancel Request
                                    </>
                                )}

                            </button>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default RequestDetails;
