import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    User,
    Phone,
    Mail,
    Wrench,
    Calendar,
    Clock,
    CheckCircle,
    Car,
    Navigation,
    Play,
    Loader2,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import api from "../../api/axios";

const ProviderRequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
    |--------------------------------------------------------------------------
    | FETCH REQUEST
    |--------------------------------------------------------------------------
    */

    const fetchRequest = async () => {
        try {
            setError("");

            const response = await api.get(
                `/provider/service-requests/${id}`
            );

            setRequest(response.data.request);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                    "Unable to load service request."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [id]);

    /*
    |--------------------------------------------------------------------------
    | AUTO REFRESH
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!request) {
            return;
        }

        if (
            [
                "provider_assigned",
                "provider_on_the_way",
                "arrived",
                "service_started",
            ].includes(request.status)
        ) {
            const interval = setInterval(() => {
                fetchRequest();
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [request?.status, id]);

    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    const updateStatus = async (newStatus) => {
        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const response = await api.put(
                `/provider/service-requests/${id}/status`,
                {
                    status: newStatus,
                }
            );

            setRequest(response.data.request);

            setSuccess(
                response.data.message ||
                    "Request status updated successfully."
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                    "Unable to update request status."
            );
        } finally {
            setUpdating(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS INFORMATION
    |--------------------------------------------------------------------------
    */

    const statusSteps = [
        {
            key: "provider_assigned",
            title: "Provider Assigned",
            description: "Request accepted by you",
        },
        {
            key: "provider_on_the_way",
            title: "On The Way",
            description: "You are travelling to customer",
        },
        {
            key: "arrived",
            title: "Arrived",
            description: "You have reached customer location",
        },
        {
            key: "service_started",
            title: "Service Started",
            description: "Service work has started",
        },
        {
            key: "service_completed",
            title: "Service Completed",
            description: "Service successfully completed",
        },
    ];

    const statusIndex = statusSteps.findIndex(
        (step) => step.key === request?.status
    );

    /*
    |--------------------------------------------------------------------------
    | ACTION BUTTON
    |--------------------------------------------------------------------------
    */

    const getAction = () => {
        switch (request?.status) {
            case "provider_assigned":
                return {
                    status: "provider_on_the_way",
                    label: "Start Journey",
                    icon: Navigation,
                };

            case "provider_on_the_way":
                return {
                    status: "arrived",
                    label: "Mark Arrived",
                    icon: MapPin,
                };

            case "arrived":
                return {
                    status: "service_started",
                    label: "Start Service",
                    icon: Play,
                };

            case "service_started":
                return {
                    status: "service_completed",
                    label: "Complete Service",
                    icon: CheckCircle,
                };

            default:
                return null;
        }
    };

    const action = getAction();

    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    const formatDateTime = (date) => {
        if (!date) {
            return "Not specified";
        }

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Loading request details...
                    </p>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    if (error && !request) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-slate-50 px-4">
                <AlertCircle className="h-12 w-12 text-red-500" />

                <p className="mt-4 text-center text-red-600">
                    {error}
                </p>

                <button
                    onClick={() =>
                        navigate("/provider/requests")
                    }
                    className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    Back to Requests
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-5xl">

                {/* BACK */}
                <button
                    onClick={() =>
                        navigate("/provider/requests")
                    }
                    className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Requests
                </button>


                {/* ALERT */}
                {error && (
                    <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        {success}
                    </div>
                )}


                {/* HEADER */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">

                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Service Request #{request.id}
                            </p>

                            <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                                {request.service?.name ||
                                    "Service Request"}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                {request.service?.category ||
                                    "Service"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-blue-50 px-4 py-3 text-center">
                            <p className="text-xs font-semibold uppercase text-blue-500">
                                Current Status
                            </p>

                            <p className="mt-1 font-bold text-blue-700">
                                {request.status
                                    ?.split("_")
                                    .map(
                                        (word) =>
                                            word
                                                .charAt(0)
                                                .toUpperCase() +
                                            word.slice(1)
                                    )
                                    .join(" ")}
                            </p>
                        </div>

                    </div>


                    {/* STATUS TIMELINE */}
                    <div className="mt-8">

                        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-400">
                            Service Progress
                        </h2>

                        <div className="space-y-4">

                            {statusSteps.map(
                                (step, index) => {

                                    const completed =
                                        statusIndex >=
                                        index;

                                    const current =
                                        request.status ===
                                        step.key;

                                    return (
                                        <div
                                            key={step.key}
                                            className="flex items-start gap-4"
                                        >
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                                    completed
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-slate-100 text-slate-400"
                                                }`}
                                            >
                                                {completed ? (
                                                    <CheckCircle className="h-5 w-5" />
                                                ) : (
                                                    <span className="text-sm font-bold">
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="pt-1">
                                                <p
                                                    className={`font-semibold ${
                                                        current
                                                            ? "text-blue-700"
                                                            : completed
                                                            ? "text-slate-800"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    {step.title}
                                                </p>

                                                <p className="mt-0.5 text-sm text-slate-500">
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


                    {/* ACTION */}
                    {action && (
                        <div className="mt-8 border-t border-slate-100 pt-6">

                            <button
                                onClick={() =>
                                    updateStatus(
                                        action.status
                                    )
                                }
                                disabled={updating}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {updating ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <action.icon className="h-5 w-5" />
                                        {action.label}
                                    </>
                                )}
                            </button>

                        </div>
                    )}

                    {request.status ===
                        "service_completed" && (
                        <div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-green-50 p-4 font-semibold text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            Service Completed Successfully
                        </div>
                    )}

                </div>


                {/* CUSTOMER + SERVICE */}
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* CUSTOMER */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />

                            <h2 className="font-bold text-slate-900">
                                Customer Information
                            </h2>
                        </div>

                        <div className="mt-5 space-y-4">

                            <div>
                                <p className="text-xs font-semibold uppercase text-slate-400">
                                    Name
                                </p>

                                <p className="mt-1 font-medium text-slate-800">
                                    {request.customer?.name ||
                                        "Not available"}
                                </p>
                            </div>

                            {request.customer?.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-slate-400" />

                                    <span className="text-sm text-slate-700">
                                        {request.customer.phone}
                                    </span>
                                </div>
                            )}

                            {request.customer?.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-slate-400" />

                                    <span className="break-all text-sm text-slate-700">
                                        {request.customer.email}
                                    </span>
                                </div>
                            )}

                        </div>

                    </div>


                    {/* SERVICE */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-blue-600" />

                            <h2 className="font-bold text-slate-900">
                                Service Information
                            </h2>
                        </div>

                        <div className="mt-5">

                            <p className="font-semibold text-slate-800">
                                {request.service?.name ||
                                    "Service"}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {request.service?.category ||
                                    "Category"}
                            </p>

                            {request.service?.description && (
                                <p className="mt-4 text-sm leading-6 text-slate-600">
                                    {
                                        request.service
                                            .description
                                    }
                                </p>
                            )}

                        </div>

                    </div>

                </div>


                {/* LOCATION */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-500" />

                        <h2 className="font-bold text-slate-900">
                            Service Location
                        </h2>
                    </div>

                    <p className="mt-4 leading-6 text-slate-700">
                        {request.address ||
                            "Address not available"}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-400">
                                LATITUDE
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                {request.latitude}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-400">
                                LONGITUDE
                            </p>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                                {request.longitude}
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={() => {
                            window.open(
                                `https://www.google.com/maps/search/?api=1&query=${request.latitude},${request.longitude}`,
                                "_blank"
                            );
                        }}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <MapPin className="h-4 w-4" />
                        Open in Maps
                    </button>

                </div>


                {/* TIME + PROBLEM */}
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* TIME */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />

                            <h2 className="font-bold text-slate-900">
                                Service Time
                            </h2>
                        </div>

                        <p className="mt-4 font-medium text-slate-800">
                            {request.request_type === "now"
                                ? "⚡ Immediate Service"
                                : "📅 Scheduled Service"}
                        </p>

                        {request.scheduled_at && (
                            <p className="mt-2 text-sm text-slate-500">
                                {formatDateTime(
                                    request.scheduled_at
                                )}
                            </p>
                        )}

                        <p className="mt-4 text-xs text-slate-400">
                            REQUEST CREATED
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                            {formatDateTime(
                                request.created_at
                            )}
                        </p>

                    </div>


                    {/* PROBLEM */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                        <div className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-orange-500" />

                            <h2 className="font-bold text-slate-900">
                                Customer Problem
                            </h2>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-600">
                            {request.problem_description ||
                                "No problem description provided."}
                        </p>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default ProviderRequestDetails;

