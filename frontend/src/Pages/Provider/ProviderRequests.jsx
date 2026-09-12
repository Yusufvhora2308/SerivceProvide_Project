    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";
    import Swal from "sweetalert2";
    import {
        RefreshCw,
        MapPin,
        Calendar,
        Clock,
        User,
        Phone,
        Wrench,
        CheckCircle,
        AlertCircle,
        Loader2,
        Eye,
        Navigation,
        Play,
    } from "lucide-react";

    import api from "../../api/axios";

    const ProviderRequests = () => {
        const navigate = useNavigate();

        const [requests, setRequests] = useState([]);
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);

        const [acceptingId, setAcceptingId] =
            useState(null);

        const [error, setError] = useState("");
        const [success, setSuccess] = useState("");

        /*
        |--------------------------------------------------------------------------
        | FETCH REQUESTS
        |--------------------------------------------------------------------------
        */

        const fetchRequests = async (
            showRefreshLoader = false
        ) => {
            try {
                setError("");

                if (showRefreshLoader) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const response = await api.get(
                    "/provider/service-requests"
                );

                setRequests(
                    response.data.requests || []
                );
            } catch (error) {
                console.error(
                    "Provider requests error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                        "Unable to load service requests."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        /*
        |--------------------------------------------------------------------------
        | INITIAL LOAD
        |--------------------------------------------------------------------------
        */

        useEffect(() => {
            fetchRequests();
        }, []);

        /*
        |--------------------------------------------------------------------------
        | ACCEPT REQUEST
        |--------------------------------------------------------------------------
        */

        const handleAccept = async (requestId) => {
        const confirmed = await Swal.fire({
            title: "Accept Service Request?",
            text: "Are you sure you want to accept this request?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Accept",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#64748b",
        });

        if (!confirmed.isConfirmed) {
            return;
        }

        try {
            setAcceptingId(requestId);
            setError("");
            setSuccess("");

            const response = await api.post(
                `/provider/service-requests/${requestId}/accept`
            );

            const acceptedRequest =
                response.data.request;

            const updatedRequest = {
                ...requests.find(
                    (request) => request.id === requestId
                ),
                ...(acceptedRequest || {}),
                status:
                    acceptedRequest?.status ||
                    "provider_assigned",
            };

            setRequests((previousRequests) =>
                previousRequests.map((request) =>
                    request.id === requestId
                        ? updatedRequest
                        : request
                )
            );

            Swal.fire({
                title: "Request Accepted Successfully! 🎉",
                html: `
                    <div style="text-align:left;">

                        <div style="
                            background:#f8fafc;
                            padding:14px;
                            border-radius:12px;
                            margin-bottom:12px;
                        ">
                            <p style="
                                margin:0 0 6px;
                                font-size:13px;
                                color:#64748b;
                            ">
                                Customer
                            </p>

                            <p style="
                                margin:0;
                                font-weight:600;
                                color:#0f172a;
                            ">
                                ${updatedRequest.customer?.name || "Customer"}
                            </p>
                        </div>

                        <div style="
                            background:#f8fafc;
                            padding:14px;
                            border-radius:12px;
                            margin-bottom:12px;
                        ">
                            <p style="
                                margin:0 0 6px;
                                font-size:13px;
                                color:#64748b;
                            ">
                                Service
                            </p>

                            <p style="
                                margin:0;
                                font-weight:600;
                                color:#0f172a;
                            ">
                                ${updatedRequest.service?.name || "Service"}
                            </p>
                        </div>

                        <div style="
                            background:#f8fafc;
                            padding:14px;
                            border-radius:12px;
                            margin-bottom:12px;
                        ">
                            <p style="
                                margin:0 0 6px;
                                font-size:13px;
                                color:#64748b;
                            ">
                                Address
                            </p>

                            <p style="
                                margin:0;
                                color:#334155;
                            ">
                                ${updatedRequest.address || "Address not available"}
                            </p>
                        </div>

                        <div style="
                            background:#fffbeb;
                            padding:14px;
                            border-radius:12px;
                            margin-bottom:12px;
                        ">
                            <p style="
                                margin:0 0 6px;
                                font-size:13px;
                                color:#92400e;
                            ">
                                Problem Description
                            </p>

                            <p style="
                                margin:0;
                                color:#334155;
                            ">
                                ${
                                    updatedRequest.problem_description ||
                                    "No description provided."
                                }
                            </p>
                        </div>

                        <div style="
                            display:flex;
                            justify-content:space-between;
                            gap:10px;
                            background:#eff6ff;
                            padding:14px;
                            border-radius:12px;
                        ">
                            <div>
                                <p style="
                                    margin:0 0 5px;
                                    font-size:12px;
                                    color:#64748b;
                                ">
                                    Request Type
                                </p>

                                <strong style="color:#1e3a8a;">
                                    ${
                                        updatedRequest.request_type === "now"
                                            ? "⚡ Instant"
                                            : "📅 Scheduled"
                                    }
                                </strong>
                            </div>

                            <div>
                                <p style="
                                    margin:0 0 5px;
                                    font-size:12px;
                                    color:#64748b;
                                ">
                                    Status
                                </p>

                                <strong style="color:#2563eb;">
                                    Provider Assigned
                                </strong>
                            </div>
                        </div>

                    </div>
                `,
                icon: "success",
                confirmButtonText: "View Details",
                showCancelButton: true,
                cancelButtonText: "Close",
                confirmButtonColor: "#2563eb",
                cancelButtonColor: "#64748b",
                width: "600px",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(
                        `/provider/service-requests/${requestId}`
                    );
                }
            });

        } catch (error) {
            console.error(
                "Accept request error:",
                error
            );

            Swal.fire({
                title: "Unable to Accept Request",
                text:
                    error.response?.data?.message ||
                    "Something went wrong while accepting the request.",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#dc2626",
            });

            setError(
                error.response?.data?.message ||
                    "Unable to accept service request."
            );
        } finally {
            setAcceptingId(null);
        }
    };

        /*
        |--------------------------------------------------------------------------
        | STATUS STYLE
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | STATUS LABEL
        |--------------------------------------------------------------------------
        */

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

        /*
        |--------------------------------------------------------------------------
        | DATE FORMAT
        |--------------------------------------------------------------------------
        */

        const formatDate = (date) => {
            if (!date) {
                return "Not specified";
            }

            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        };

        const formatDateTime = (date) => {
            if (!date) {
                return "Not specified";
            }

            return new Date(date).toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        };

        /*
        |--------------------------------------------------------------------------
        | ACTION BUTTON
        |--------------------------------------------------------------------------
        */

        const getActionButton = (request) => {
            switch (request.status) {
                case "searching":
                    return {
                        label: "Accept Request",
                        icon: CheckCircle,
                        type: "accept",
                    };

                case "provider_assigned":
                    return {
                        label: "Continue Request",
                        icon: Navigation,
                        type: "manage",
                    };

                case "provider_on_the_way":
                    return {
                        label: "Manage Request",
                        icon: Navigation,
                        type: "manage",
                    };

                case "arrived":
                    return {
                        label: "Manage Request",
                        icon: MapPin,
                        type: "manage",
                    };

                case "service_started":
                    return {
                        label: "Manage Request",
                        icon: Play,
                        type: "manage",
                    };

                default:
                    return null;
            }
        };

        /*
        |--------------------------------------------------------------------------
        | OPEN REQUEST DETAILS
        |--------------------------------------------------------------------------
        */

        const openRequestDetails = (requestId) => {
            navigate(
                `/provider/service-requests/${requestId}`
            );
        };

        /*
        |--------------------------------------------------------------------------
        | LOADING
        |--------------------------------------------------------------------------
        */

        if (loading) {
            return (
                <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
                    <div className="text-center">

                        <Loader2
                            className="mx-auto h-10 w-10 animate-spin text-blue-600"
                        />

                        <p className="mt-4 text-sm text-slate-500">
                            Loading service requests...
                        </p>

                    </div>
                </div>
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PAGE
        |--------------------------------------------------------------------------
        */

        return (
            <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 md:p-6">

                <div className="mx-auto max-w-7xl">

                    {/* HEADER */}

                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                        <div>

                            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                Service Requests
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                View and manage customer service requests.
                            </p>

                        </div>

                        <button
                            onClick={() =>
                                fetchRequests(true)
                            }
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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


                    {/* SUCCESS */}

                    {success && (
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">

                            <CheckCircle className="h-5 w-5 shrink-0" />

                            <span>{success}</span>

                        </div>
                    )}


                    {/* ERROR */}

                    {error && (
                        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                            <AlertCircle className="h-5 w-5 shrink-0" />

                            <span>{error}</span>

                        </div>
                    )}


                    {/* EMPTY */}

                    {requests.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                                <Wrench className="h-8 w-8 text-slate-400" />

                            </div>

                            <h2 className="mt-5 text-xl font-bold text-slate-900">
                                No Service Requests
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                There are currently no service requests.
                                New customer requests will appear here.
                            </p>

                            <button
                                onClick={() =>
                                    fetchRequests(true)
                                }
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                            >

                                <RefreshCw className="h-4 w-4" />

                                Check Again

                            </button>

                        </div>
                    )}


                    {/* REQUEST LIST */}

                    {requests.length > 0 && (
                        <div className="space-y-5">

                            {requests.map((request) => {

                                const isSearching =
                                    request.status ===
                                    "searching";

                                const isAccepting =
                                    acceptingId ===
                                    request.id;

                                const action =
                                    getActionButton(
                                        request
                                    );

                                const ActionIcon =
                                    action?.icon;

                                return (
                                    <div
                                        key={request.id}
                                        className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                                            isSearching
                                                ? "border-yellow-300 ring-1 ring-yellow-100"
                                                : "border-slate-200"
                                        }`}
                                    >

                                        {/* NEW REQUEST HEADER */}

                                        {isSearching && (
                                            <div className="flex items-center gap-2 bg-yellow-50 border-b border-yellow-100 px-5 py-3">

                                                <AlertCircle
                                                    className="h-5 w-5 text-yellow-600"
                                                />

                                                <span className="text-sm font-bold text-yellow-800">
                                                    New Service Request
                                                </span>

                                            </div>
                                        )}


                                        {/* TOP */}

                                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:p-6">

                                            <div>

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Request #
                                                        {request.id}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            request.status
                                                        )}
                                                    </span>

                                                </div>

                                                <h2 className="mt-2 text-xl font-bold text-slate-900">
                                                    {request.service?.name ||
                                                        "Service"}
                                                </h2>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {request.service?.category ||
                                                        "Service Request"}
                                                </p>

                                            </div>


                                            {/* ACTIONS */}

                                            <div className="flex flex-wrap gap-2">

                                                {/* VIEW DETAILS */}

                                                <button
                                                    onClick={() =>
                                                        openRequestDetails(
                                                            request.id
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >

                                                    <Eye className="h-4 w-4" />

                                                    View Details

                                                </button>


                                                {/* ACCEPT / MANAGE */}

                                                {action && (
                                                    <>
                                                        {action.type ===
                                                        "accept" ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleAccept(
                                                                        request.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    isAccepting
                                                                }
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >

                                                                {isAccepting ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 animate-spin" />

                                                                        Accepting...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="h-4 w-4" />

                                                                        Accept Request
                                                                    </>
                                                                )}

                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    openRequestDetails(
                                                                        request.id
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                            >

                                                                {ActionIcon && (
                                                                    <ActionIcon className="h-4 w-4" />
                                                                )}

                                                                {
                                                                    action.label
                                                                }

                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                            </div>

                                        </div>


                                        {/* DETAILS */}

                                        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 md:p-6">

                                            {/* CUSTOMER */}

                                            <div className="rounded-xl bg-slate-50 p-4">

                                                <div className="flex items-center gap-2">

                                                    <User className="h-4 w-4 text-slate-500" />

                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Customer
                                                    </p>

                                                </div>

                                                <p className="mt-2 font-semibold text-slate-900">
                                                    {request.customer?.name ||
                                                        "Customer"}
                                                </p>

                                                {request.customer?.phone && (
                                                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">

                                                        <Phone className="h-3.5 w-3.5" />

                                                        {request.customer.phone}

                                                    </p>
                                                )}

                                                {request.customer?.email && (
                                                    <p className="mt-1 truncate text-sm text-slate-500">
                                                        {request.customer.email}
                                                    </p>
                                                )}

                                            </div>


                                            {/* SERVICE */}

                                            <div className="rounded-xl bg-slate-50 p-4">

                                                <div className="flex items-center gap-2">

                                                    <Wrench className="h-4 w-4 text-slate-500" />

                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Service
                                                    </p>

                                                </div>

                                                <p className="mt-2 font-semibold text-slate-900">
                                                    {request.service?.name ||
                                                        "Service"}
                                                </p>

                                                {request.service?.category && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {
                                                            request
                                                                .service
                                                                .category
                                                        }
                                                    </p>
                                                )}

                                            </div>


                                            {/* LOCATION */}

                                            <div className="rounded-xl bg-slate-50 p-4">

                                                <div className="flex items-center gap-2">

                                                    <MapPin className="h-4 w-4 text-red-500" />

                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Service Location
                                                    </p>

                                                </div>

                                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                                    {request.address ||
                                                        "Address not available"}
                                                </p>

                                                {request.latitude &&
                                                    request.longitude && (
                                                        <p className="mt-2 text-xs text-slate-400">
                                                            GPS location available
                                                        </p>
                                                    )}

                                            </div>


                                            {/* SERVICE TIME */}

                                            <div className="rounded-xl bg-slate-50 p-4">

                                                <div className="flex items-center gap-2">

                                                    <Clock className="h-4 w-4 text-slate-500" />

                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Service Time
                                                    </p>

                                                </div>

                                                <p className="mt-2 font-medium text-slate-800">

                                                    {request.request_type ===
                                                    "now"
                                                        ? "⚡ Immediate Service"
                                                        : "📅 Scheduled Service"}

                                                </p>

                                                {request.scheduled_at && (
                                                    <p className="mt-1 text-sm text-slate-500">

                                                        {formatDateTime(
                                                            request.scheduled_at
                                                        )}

                                                    </p>
                                                )}

                                            </div>


                                            {/* CREATED */}

                                            <div className="rounded-xl bg-slate-50 p-4">

                                                <div className="flex items-center gap-2">

                                                    <Calendar className="h-4 w-4 text-slate-500" />

                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Request Created
                                                    </p>

                                                </div>

                                                <p className="mt-2 text-sm font-medium text-slate-800">
                                                    {formatDate(
                                                        request.created_at
                                                    )}
                                                </p>

                                            </div>

                                        </div>


                                        {/* PROBLEM */}

                                        <div className="border-t border-slate-100 px-5 py-5 md:px-6">

                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Customer Problem
                                            </p>

                                            <p className="mt-2 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-slate-700">

                                                {request.problem_description ||
                                                    "No description provided."}

                                            </p>

                                        </div>


                                        {/* BOTTOM */}

                                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 md:px-6">

                                            <div className="flex flex-col justify-between gap-3 text-sm sm:flex-row sm:items-center">

                                                <div>

                                                    <span className="text-slate-400">
                                                        Status:
                                                    </span>{" "}

                                                    <span className="font-semibold text-slate-700">
                                                        {formatStatus(
                                                            request.status
                                                        )}
                                                    </span>

                                                </div>

                                                <div>

                                                    <span className="text-slate-400">
                                                        Request Type:
                                                    </span>{" "}

                                                    <span className="font-medium text-slate-700">

                                                        {request.request_type ===
                                                        "now"
                                                            ? "Immediate"
                                                            : "Scheduled"}

                                                    </span>

                                                </div>

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

    export default ProviderRequests;

