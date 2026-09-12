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
    IndianRupee,
    AlertCircle,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";

const MyRequests = () => {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    // Price action loading
    const [priceActionId, setPriceActionId] = useState(null);

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
    // APPROVE PRICE
    // ==========================================

const handleApprovePrice = async (requestId) => {
    const result = await Swal.fire({
        title: "Approve Price?",
        text: "Are you sure you want to approve this final price?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Approve",
        cancelButtonText: "Cancel",
        reverseButtons: true,
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        setPriceActionId(requestId);

        await api.post(
            `/customer/service-requests/${requestId}/approve-price`
        );

        await fetchRequests(true);

        await Swal.fire({
            title: "Price Approved!",
            text: "The final price has been approved successfully.",
            icon: "success",
            confirmButtonText: "OK",
        });

    } catch (error) {
        console.error(
            "Approve Price Error:",
            error
        );

        Swal.fire({
            title: "Error",
            text:
                error.response?.data?.message ||
                "Unable to approve the price.",
            icon: "error",
            confirmButtonText: "OK",
        });

    } finally {
        setPriceActionId(null);
    }
};

    // ==========================================
    // REJECT PRICE
    // ==========================================

   const handleRejectPrice = async (requestId) => {
    const result = await Swal.fire({
        title: "Reject Price?",
        text: "Are you sure you want to reject this final price?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Reject",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        reverseButtons: true,
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        setPriceActionId(requestId);

        await api.post(
            `/customer/service-requests/${requestId}/reject-price`
        );

        await fetchRequests(true);

        await Swal.fire({
            title: "Price Rejected",
            text: "The provider can now update the price and resend it.",
            icon: "info",
            confirmButtonText: "OK",
        });

    } catch (error) {
        console.error(
            "Reject Price Error:",
            error
        );

        Swal.fire({
            title: "Error",
            text:
                error.response?.data?.message ||
                "Unable to reject the price.",
            icon: "error",
            confirmButtonText: "OK",
        });

    } finally {
        setPriceActionId(null);
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
// DATE & TIME FORMAT
// ==========================================

// Format date: 12 Sep 2026
const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// Format time: 02:30 PM
const formatTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

// Format date + time: 12 Sep 2026, 02:30 PM
const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

    // ==========================================
    // PRICE FORMAT
    // ==========================================

    const formatPrice = (price) => {
        if (
            price === null ||
            price === undefined ||
            price === ""
        ) {
            return "0.00";
        }

        return Number(price).toFixed(2);
    };

    // ==========================================
    // PRICE STATUS STYLE
    // ==========================================

    const getPriceStatusStyle = (status) => {
        switch (status) {
            case "locked":
                return "bg-blue-100 text-blue-700";

            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "approved":
                return "bg-green-100 text-green-700";

            case "rejected":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    // ==========================================
    // PRICE STATUS TEXT
    // ==========================================

    const getPriceStatusText = (status) => {
        switch (status) {
            case "locked":
                return "Price Locked";

            case "pending":
                return "Waiting for Your Approval";

            case "approved":
                return "Price Approved";

            case "rejected":
                return "Price Rejected";

            default:
                return "Price Not Available";
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
                                PRICE DETAILS
                            ================================== */}

                            {request.provider_service_price !== null &&
                                request.provider_service_price !== undefined && (

                                <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                                    {/* Price Header */}

                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                                                <IndianRupee className="h-5 w-5 text-green-600" />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    Price Details
                                                </h3>

                                                <p className="text-xs text-gray-500">
                                                    Service charges
                                                </p>
                                            </div>

                                        </div>

                                        {/* Price Status */}

                                        <span
                                            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getPriceStatusStyle(
                                                request.price_status
                                            )}`}
                                        >
                                            {getPriceStatusText(
                                                request.price_status
                                            )}
                                        </span>

                                    </div>

                                    {/* Price Rows */}

                                    <div className="mt-5 space-y-3">

                                        {/* Basic Price */}

                                        <div className="flex items-center justify-between">

                                            <span className="text-sm text-gray-600">
                                                Basic Visit Price
                                            </span>

                                            <span className="font-semibold text-gray-900">
                                                ₹
                                                {formatPrice(
                                                    request.provider_service_price
                                                )}
                                            </span>

                                        </div>

                                        {/* Extra Charges */}

                                        <div className="flex items-center justify-between">

                                            <span className="text-sm text-gray-600">
                                                Extra Charges
                                            </span>

                                            <span className="font-semibold text-gray-900">
                                                ₹
                                                {formatPrice(
                                                    request.extra_charges
                                                )}
                                            </span>

                                        </div>

                                        {/* Extra Charge Reason */}

                                        {request.extra_charges_reason && (
                                            <div className="rounded-xl bg-yellow-50 p-3">

                                                <div className="flex gap-2">

                                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />

                                                    <div>

                                                        <p className="text-xs font-semibold text-yellow-700">
                                                            Extra Charge Reason
                                                        </p>

                                                        <p className="mt-1 text-sm text-yellow-800">
                                                            {request.extra_charges_reason}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>
                                        )}

                                        {/* Divider */}

                                        <div className="border-t border-dashed border-gray-200 pt-3">

                                            <div className="flex items-center justify-between">

                                                <span className="font-semibold text-gray-800">
                                                    Final Price
                                                </span>

                                                <span className="text-xl font-bold text-green-600">
                                                    ₹
                                                    {formatPrice(
                                                        request.final_price
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                    {/* Customer Approval */}

                                    {request.price_status === "pending" && (

                                        <div className="mt-5 border-t pt-5">

                                            <p className="mb-4 text-sm text-gray-600">
                                                The provider has updated the
                                                final price. Please review and
                                                approve or reject it.
                                            </p>

                                            <div className="flex flex-col gap-3 sm:flex-row">

                                                <button
                                                    onClick={() =>
                                                        handleApprovePrice(
                                                            request.id
                                                        )
                                                    }
                                                    disabled={
                                                        priceActionId ===
                                                        request.id
                                                    }
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                >

                                                    {priceActionId ===
                                                    request.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4" />
                                                            Approve Price
                                                        </>
                                                    )}

                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleRejectPrice(
                                                            request.id
                                                        )
                                                    }
                                                    disabled={
                                                        priceActionId ===
                                                        request.id
                                                    }
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                >

                                                    {priceActionId ===
                                                    request.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4" />
                                                            Reject Price
                                                        </>
                                                    )}

                                                </button>

                                            </div>

                                        </div>

                                    )}

                                    {/* Approved Message */}

                                    {request.price_status === "approved" && (
                                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
                                            <CheckCircle className="h-5 w-5" />
                                            Final price approved successfully.
                                        </div>
                                    )}

                                    {/* Rejected Message */}

                                    {request.price_status === "rejected" && (
                                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                                            <XCircle className="h-5 w-5" />
                                            This price was rejected.
                                        </div>
                                    )}

                                    {/* Locked Message */}

                                    {request.price_status === "locked" && (
                                        <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-medium text-blue-700">
                                            <CheckCircle className="h-5 w-5" />
                                            Basic service price is locked.
                                        </div>
                                    )}

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

