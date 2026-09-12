import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    MapPin,
    User,
    Phone,
    Mail,
    Wrench,
    Clock,
    CheckCircle,
    Navigation,
    Play,
    Loader2,
    AlertCircle,
    RefreshCw,
    Bike,
    Radio,
    IndianRupee,
} from "lucide-react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import api from "../../api/axios";


// ==================================================
// CUSTOMER MARKER ICON
// ==================================================

const customerIcon = new L.Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});


// ==================================================
// PROVIDER BIKE ICON
// ==================================================

const providerIcon = L.divIcon({
    className: "provider-bike-marker",

    html: `
        <div style="
            width:42px;
            height:42px;
            background:#2563eb;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            border:4px solid white;
            box-shadow:0 3px 10px rgba(0,0,0,0.3);
            font-size:21px;
        ">
            🛵
        </div>
    `,

    iconSize: [42, 42],
    iconAnchor: [21, 21],
});


// ==================================================
// MAP CENTER
// ==================================================

const MapCenter = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 14);
        }
    }, [position, map]);

    return null;
};


// ==================================================
// SMOOTH PROVIDER MARKER
// ==================================================

const SmoothProviderMarker = ({ position }) => {
    const markerRef = useRef(null);

    useEffect(() => {
        if (!position || !markerRef.current) {
            return;
        }

        const marker = markerRef.current;

        const current = marker.getLatLng();

        const startLat = current.lat;
        const startLng = current.lng;

        const endLat = position[0];
        const endLng = position[1];

        const duration = 1500;
        const startTime = performance.now();

        const animate = (time) => {
            const progress = Math.min(
                (time - startTime) / duration,
                1
            );

            const lat =
                startLat +
                (endLat - startLat) * progress;

            const lng =
                startLng +
                (endLng - startLng) * progress;

            marker.setLatLng([lat, lng]);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [position]);

    return (
        <Marker
            ref={markerRef}
            position={position}
            icon={providerIcon}
        >
            <Popup>
                <strong>Provider Location</strong>
                <br />
                Live provider location
            </Popup>
        </Marker>
    );
};


// ==================================================
// MAIN COMPONENT
// ==================================================

const ProviderRequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --------------------------------------------------
    // STATES
    // --------------------------------------------------

    const [request, setRequest] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [updating, setUpdating] = useState(false);

    const [locationLoading, setLocationLoading] =
        useState(false);

    const [providerLocation, setProviderLocation] =
        useState(null);

    // --------------------------------------------------
    // PRICE STATES
    // --------------------------------------------------

    const [extraCharges, setExtraCharges] =
        useState("");

    const [extraChargesReason, setExtraChargesReason] =
        useState("");

    const [priceUpdating, setPriceUpdating] =
        useState(false);


    // ==================================================
    // FETCH REQUEST
    // ==================================================

    const fetchRequest = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/provider/service-requests/${id}`
            );

            if (response.data.success) {
                const requestData =
                    response.data.request;

                setRequest(requestData);

                // --------------------------------------
                // Load existing extra charges
                // --------------------------------------

                if (
                    requestData.extra_charges !== null &&
                    requestData.extra_charges !== undefined
                ) {
                    setExtraCharges(
                        String(requestData.extra_charges)
                    );
                } else {
                    setExtraCharges("");
                }

                // --------------------------------------
                // Load existing reason
                // --------------------------------------

                if (
                    requestData.extra_charges_reason
                ) {
                    setExtraChargesReason(
                        requestData.extra_charges_reason
                    );
                } else {
                    setExtraChargesReason("");
                }
            } else {
                setError(
                    response.data.message ||
                        "Unable to load request."
                );
            }
        } catch (err) {
            console.error(
                "Request Fetch Error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load service request."
            );
        } finally {
            setLoading(false);
        }
    };


    // ==================================================
    // FETCH PROVIDER LIVE LOCATION
    // ==================================================

    const fetchProviderLocation = async () => {
        try {
            setLocationLoading(true);

            const response = await api.get(
                `/provider/service-requests/${id}/live-location`
            );

            /*
             * Backend response:
             *
             * provider_location: {
             *     latitude,
             *     longitude,
             *     ...
             * }
             */

            if (
                response.data.success &&
                response.data.provider_location
            ) {
                const location =
                    response.data.provider_location;

                const lat = Number(
                    location.latitude
                );

                const lng = Number(
                    location.longitude
                );

                if (
                    !Number.isNaN(lat) &&
                    !Number.isNaN(lng)
                ) {
                    setProviderLocation([
                        lat,
                        lng,
                    ]);
                }
            }
        } catch (err) {
            console.error(
                "Provider Location Error:",
                err.response?.data || err.message
            );
        } finally {
            setLocationLoading(false);
        }
    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        fetchRequest();
    }, [id]);


    // ==================================================
    // LIVE LOCATION POLLING
    // ==================================================

    useEffect(() => {
        if (!request) {
            return;
        }

        const liveStatuses = [
            "provider_assigned",
            "provider_on_the_way",
            "arrived",
            "service_started",
        ];

        if (
            !liveStatuses.includes(
                request.status
            )
        ) {
            return;
        }

        fetchProviderLocation();

        const interval = setInterval(() => {
            fetchProviderLocation();
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [request?.status, id]);


    // ==================================================
    // UPDATE SERVICE STATUS
    // ==================================================

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

            if (response.data.success) {
                setRequest(
                    response.data.request
                );

                setSuccess(
                    response.data.message ||
                        "Status updated successfully."
                );

                fetchProviderLocation();
            } else {
                setError(
                    response.data.message ||
                        "Unable to update status."
                );
            }
        } catch (err) {
            console.error(
                "Status Update Error:",
                err.response?.data || err.message
            );

            setError(
                err.response?.data?.message ||
                    "Unable to update request status."
            );
        } finally {
            setUpdating(false);
        }
    };


    // ==================================================
    // PRICE UPDATE
    // ==================================================

    const updatePrice = async () => {

        // ----------------------------------------------
        // Extra charge required
        // ----------------------------------------------

        if (extraCharges === "") {
            setError(
                "Please enter extra charges."
            );

            return;
        }


        // ----------------------------------------------
        // Extra charge cannot be negative
        // ----------------------------------------------

        if (Number(extraCharges) < 0) {
            setError(
                "Extra charges cannot be negative."
            );

            return;
        }


        // ----------------------------------------------
        // If extra charge > 0, reason is required
        // ----------------------------------------------

        if (
            Number(extraCharges) > 0 &&
            !extraChargesReason.trim()
        ) {
            setError(
                "Please enter the reason for extra charges."
            );

            return;
        }


        try {
            setPriceUpdating(true);

            setError("");
            setSuccess("");

            const response = await api.put(
                `/provider/service-requests/${id}/price`,
                {
                    extra_charges:
                        Number(extraCharges),

                    extra_charges_reason:
                        extraChargesReason.trim() ||
                        null,
                }
            );

            if (response.data.success) {

                setRequest(
                    response.data.request
                );

                setSuccess(
                    response.data.message ||
                        "Final price sent to customer for approval."
                );

            } else {

                setError(
                    response.data.message ||
                        "Unable to update price."
                );
            }

        } catch (err) {

            console.error(
                "Price Update Error:",
                err.response?.data ||
                    err.message
            );

            setError(
                err.response?.data?.message ||
                    "Unable to update price."
            );

        } finally {

            setPriceUpdating(false);
        }
    };


    // ==================================================
    // NEXT STATUS ACTION
    // ==================================================

    const getNextAction = () => {
        if (!request) {
            return null;
        }

        switch (request.status) {

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


    // ==================================================
    // DATE FORMAT
    // ==================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );
    };


    // ==================================================
    // PRICE FORMAT
    // ==================================================

    const formatPrice = (price) => {
        if (
            price === null ||
            price === undefined
        ) {
            return "₹0.00";
        }

        return `₹${Number(price).toFixed(2)}`;
    };


    // ==================================================
    // STATUS TEXT
    // ==================================================

    const getStatusText = (status) => {
        switch (status) {

            case "searching":
                return "Searching";

            case "provider_assigned":
                return "Provider Assigned";

            case "provider_on_the_way":
                return "Provider On The Way";

            case "arrived":
                return "Provider Arrived";

            case "service_started":
                return "Service Started";

            case "service_completed":
                return "Service Completed";

            case "cancelled":
                return "Cancelled";

            default:
                return status
                    ? status.replaceAll(
                          "_",
                          " "
                      )
                    : "Unknown";
        }
    };


    // ==================================================
    // PRICE STATUS TEXT
    // ==================================================

    const getPriceStatusText = (status) => {

        switch (status) {

            case "locked":
                return "Basic Price Locked";

            case "pending":
                return "Waiting for Customer Approval";

            case "approved":
                return "Customer Approved";

            case "rejected":
                return "Customer Rejected";

            default:
                return "Not Set";
        }
    };


    // ==================================================
    // PRICE STATUS STYLE
    // ==================================================

    const getPriceStatusClass = (status) => {

        switch (status) {

            case "locked":
                return "bg-blue-50 text-blue-700";

            case "pending":
                return "bg-yellow-50 text-yellow-700";

            case "approved":
                return "bg-green-50 text-green-700";

            case "rejected":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-50 text-gray-700";
        }
    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">

                <Loader2
                    size={40}
                    className="animate-spin text-blue-600"
                />

            </div>
        );
    }


    // ==================================================
    // ERROR / NO REQUEST
    // ==================================================

    if (!request) {

        return (
            <div className="min-h-screen bg-gray-50 p-6">

                <div className="max-w-4xl mx-auto">

                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft
                            size={20}
                        />

                        Back
                    </button>


                    <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">

                        <AlertCircle
                            size={45}
                            className="mx-auto text-red-500 mb-4"
                        />

                        <h2 className="text-xl font-semibold">
                            Request Not Found
                        </h2>

                        <p className="text-gray-500 mt-2">
                            {error ||
                                "Unable to load this service request."}
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ==================================================
    // PRICE PERMISSIONS
    // ==================================================

    /*
     * Provider can add/edit extra charges only after
     * reaching customer.
     */

    const canAddExtraCharges = [
        "arrived",
        "service_started",
    ].includes(request.status);


    /*
     * Customer has not responded yet.
     *
     * During pending:
     * Provider should not change the submitted price.
     */

    const pricePending =
        request.price_status === "pending";


    /*
     * Customer already approved.
     *
     * Final price is locked.
     */

    const priceApproved =
        request.price_status === "approved";


    /*
     * Customer rejected.
     *
     * Provider can submit a new price.
     */

    const priceRejected =
        request.price_status === "rejected";


    /*
     * Provider can edit price when:
     *
     * 1. Provider has arrived/service started
     * 2. Price is not pending
     * 3. Price is not approved
     */

    const canEditPrice =
        canAddExtraCharges &&
        !pricePending &&
        !priceApproved;


    // ==================================================
    // CUSTOMER LOCATION
    // ==================================================

    const customerPosition =
        request.latitude &&
        request.longitude
            ? [
                  Number(
                      request.latitude
                  ),
                  Number(
                      request.longitude
                  ),
              ]
            : null;


    // ==================================================
    // PROVIDER POSITION
    // ==================================================

    const currentProviderPosition =
        providerLocation;


    // ==================================================
    // MAP LINE
    // ==================================================

    const routeLine =
        customerPosition &&
        currentProviderPosition
            ? [
                  customerPosition,
                  currentProviderPosition,
              ]
            : [];


    // ==================================================
    // NEXT ACTION
    // ==================================================

    const nextAction =
        getNextAction();


    // ==================================================
    // FINAL PRICE PREVIEW
    // ==================================================

    const basicPrice = Number(
        request.provider_service_price || 0
    );

    const enteredExtraCharges =
        Number(extraCharges || 0);

    const calculatedFinalPrice =
        basicPrice +
        enteredExtraCharges;


    // ==================================================
    // BUTTON TEXT
    // ==================================================

    const priceButtonText =
        priceRejected
            ? "Update Price & Resend"
            : "Send Price to Customer";


    // ==================================================
    // JSX
    // ==================================================

    return (
        <div className="min-h-screen bg-gray-50">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="bg-white border-b sticky top-0 z-20">

                <div className="max-w-7xl mx-auto px-6 py-4">

                    <div className="flex items-center justify-between">

                        <button
                            onClick={() =>
                                navigate(-1)
                            }
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft
                                size={20}
                            />

                            <span>
                                Back
                            </span>
                        </button>


                        <div className="flex items-center gap-3">

                            <div
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                    request.status ===
                                    "service_completed"
                                        ? "bg-green-100 text-green-700"
                                        : request.status ===
                                          "cancelled"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-blue-100 text-blue-700"
                                }`}
                            >
                                {getStatusText(
                                    request.status
                                )}
                            </div>


                            <button
                                onClick={() => {
                                    fetchRequest();
                                    fetchProviderLocation();
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100"
                                title="Refresh"
                            >
                                <RefreshCw
                                    size={20}
                                />
                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                MAIN
            ================================================== */}

            <div className="max-w-7xl mx-auto px-6 py-6">


                {/* ==================================================
                    SUCCESS
                ================================================== */}

                {success && (
                    <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">

                        <CheckCircle
                            size={20}
                        />

                        {success}

                    </div>
                )}


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">

                        <AlertCircle
                            size={20}
                        />

                        {error}

                    </div>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


                    {/* ==================================================
                        LEFT SIDE
                    ================================================== */}

                    <div className="space-y-6">


                        {/* ==================================================
                            CUSTOMER DETAILS
                        ================================================== */}

                        <div className="bg-white rounded-2xl shadow-sm border p-5">

                            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">

                                <User
                                    size={20}
                                />

                                Customer Details

                            </h2>


                            <div className="space-y-4">


                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">

                                        <User
                                            size={20}
                                            className="text-blue-600"
                                        />

                                    </div>


                                    <div>

                                        <p className="font-semibold">

                                            {
                                                request
                                                    .customer
                                                    ?.name
                                            }

                                        </p>

                                        <p className="text-sm text-gray-500">
                                            Customer
                                        </p>

                                    </div>

                                </div>


                                <div className="flex items-center gap-3 text-gray-600">

                                    <Phone
                                        size={18}
                                    />

                                    <span>

                                        {
                                            request
                                                .customer
                                                ?.phone ||
                                            "N/A"
                                        }

                                    </span>

                                </div>


                                <div className="flex items-center gap-3 text-gray-600">

                                    <Mail
                                        size={18}
                                    />

                                    <span>

                                        {
                                            request
                                                .customer
                                                ?.email ||
                                            "N/A"
                                        }

                                    </span>

                                </div>


                                <div className="flex items-start gap-3 text-gray-600">

                                    <MapPin
                                        size={18}
                                        className="mt-1"
                                    />

                                    <span>
                                        {
                                            request.address
                                        }
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            SERVICE DETAILS
                        ================================================== */}

                        <div className="bg-white rounded-2xl shadow-sm border p-5">

                            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">

                                <Wrench
                                    size={20}
                                />

                                Service Details

                            </h2>


                            <div className="space-y-4">


                                <div>

                                    <p className="text-sm text-gray-500">
                                        Service
                                    </p>

                                    <p className="font-semibold">

                                        {
                                            request
                                                .service
                                                ?.name
                                        }

                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm text-gray-500">
                                        Problem Description
                                    </p>

                                    <p className="text-gray-700">

                                        {
                                            request.problem_description ||
                                            "No description provided"
                                        }

                                    </p>

                                </div>


                                <div className="flex items-center gap-3">

                                    <Clock
                                        size={18}
                                        className="text-gray-500"
                                    />

                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Request Type
                                        </p>

                                        <p className="font-medium capitalize">

                                            {
                                                request.request_type
                                            }

                                        </p>

                                    </div>

                                </div>


                                {request.scheduled_at && (
                                    <div className="flex items-center gap-3">

                                        <Clock
                                            size={18}
                                            className="text-gray-500"
                                        />

                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Scheduled At
                                            </p>

                                            <p className="font-medium">

                                                {formatDate(
                                                    request.scheduled_at
                                                )}

                                            </p>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* ==================================================
                            PRICE DETAILS
                        ================================================== */}

                        <div className="bg-white rounded-2xl shadow-sm border p-5">

                            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">

                                <IndianRupee
                                    size={20}
                                />

                                Price Details

                            </h2>


                            <div className="space-y-5">


                                {/* ==================================================
                                    BASIC PRICE
                                ================================================== */}

                                <div className="flex items-center justify-between">

                                    <span className="text-gray-500">
                                        Basic Visit Price
                                    </span>

                                    <span className="font-semibold text-gray-800">

                                        {formatPrice(
                                            request.provider_service_price
                                        )}

                                    </span>

                                </div>


                                {/* ==================================================
                                    BEFORE ARRIVAL
                                ================================================== */}

                                {!canAddExtraCharges && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">

                                        <div className="flex items-start gap-3">

                                            <Clock
                                                size={20}
                                                className="text-blue-600 mt-0.5"
                                            />

                                            <div>

                                                <p className="font-semibold text-blue-800">
                                                    Basic Price is Locked
                                                </p>

                                                <p className="text-sm text-blue-700 mt-1">
                                                    Extra charges can be added after you reach the customer and inspect the actual problem.
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                )}


                                {/* ==================================================
                                    PENDING PRICE
                                ================================================== */}

                                {canAddExtraCharges &&
                                    pricePending && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">

                                            <div className="flex items-start gap-3">

                                                <Clock
                                                    size={20}
                                                    className="text-yellow-600 mt-0.5"
                                                />

                                                <div>

                                                    <p className="font-semibold text-yellow-800">
                                                        Waiting for Customer Approval
                                                    </p>

                                                    <p className="text-sm text-yellow-700 mt-1">
                                                        You have already sent this price to the customer. Please wait for the customer to approve or reject it.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>
                                    )}


                                {/* ==================================================
                                    APPROVED PRICE
                                ================================================== */}

                                {priceApproved && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">

                                        <div className="flex items-start gap-3">

                                            <CheckCircle
                                                size={20}
                                                className="text-green-600 mt-0.5"
                                            />

                                            <div>

                                                <p className="font-semibold text-green-800">
                                                    Final Price Approved
                                                </p>

                                                <p className="text-sm text-green-700 mt-1">
                                                    Customer has approved the final price. The price is now locked.
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                )}


                                {/* ==================================================
                                    REJECTED PRICE
                                ================================================== */}

                                {priceRejected &&
                                    canAddExtraCharges && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">

                                            <div className="flex items-start gap-3">

                                                <AlertCircle
                                                    size={20}
                                                    className="text-red-600 mt-0.5"
                                                />

                                                <div>

                                                    <p className="font-semibold text-red-800">
                                                        Customer Rejected the Price
                                                    </p>

                                                    <p className="text-sm text-red-700 mt-1">
                                                        Review the actual work again and enter a new extra charge and reason.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>
                                    )}


                                {/* ==================================================
                                    EXTRA CHARGES
                                ================================================== */}

                                {canEditPrice && (
                                    <>

                                        {/* EXTRA CHARGE */}

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                                Extra Charges

                                            </label>

                                            <div className="relative">

                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                    ₹
                                                </span>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        extraCharges
                                                    }
                                                    onChange={(e) =>
                                                        setExtraCharges(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter extra charges"
                                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />

                                            </div>

                                        </div>


                                        {/* REASON */}

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                                Reason for Extra Charges

                                                {Number(
                                                    extraCharges || 0
                                                ) > 0 && (
                                                    <span className="text-red-500 ml-1">
                                                        *
                                                    </span>
                                                )}

                                            </label>

                                            <textarea
                                                value={
                                                    extraChargesReason
                                                }
                                                onChange={(e) =>
                                                    setExtraChargesReason(
                                                        e.target.value
                                                    )
                                                }
                                                rows={3}
                                                placeholder="Example: Motor winding repair required"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />

                                        </div>


                                        {/* FINAL PRICE */}

                                        <div className="border-t pt-4">

                                            <div className="flex items-center justify-between">

                                                <span className="font-semibold text-gray-800">
                                                    Final Price
                                                </span>

                                                <span className="text-2xl font-bold text-green-600">

                                                    ₹
                                                    {calculatedFinalPrice.toFixed(
                                                        2
                                                    )}

                                                </span>

                                            </div>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Basic price + extra charges
                                            </p>

                                        </div>


                                        {/* SEND / RESEND BUTTON */}

                                        <button
                                            type="button"
                                            onClick={
                                                updatePrice
                                            }
                                            disabled={
                                                priceUpdating ||
                                                request.provider_service_price ===
                                                    null ||
                                                request.provider_service_price ===
                                                    undefined
                                            }
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >

                                            {priceUpdating ? (
                                                <>

                                                    <Loader2
                                                        size={18}
                                                        className="animate-spin"
                                                    />

                                                    Sending...

                                                </>
                                            ) : (
                                                <>

                                                    <IndianRupee
                                                        size={18}
                                                    />

                                                    {priceButtonText}

                                                </>
                                            )}

                                        </button>

                                    </>
                                )}


                                {/* ==================================================
                                    PRICE STATUS
                                ================================================== */}

                                {request.price_status && (
                                    <div
                                        className={`rounded-xl px-4 py-3 ${getPriceStatusClass(
                                            request.price_status
                                        )}`}
                                    >

                                        <p className="text-sm opacity-80">
                                            Price Status
                                        </p>

                                        <p className="font-semibold">
                                            {getPriceStatusText(
                                                request.price_status
                                            )}
                                        </p>

                                    </div>
                                )}


                                {/* ==================================================
                                    CURRENT FINAL PRICE
                                ================================================== */}

                                {request.final_price !==
                                    null &&
                                    request.final_price !==
                                        undefined && (
                                        <div className="flex items-center justify-between border-t pt-4">

                                            <span className="font-medium text-gray-600">
                                                Current Final Price
                                            </span>

                                            <span className="font-bold text-gray-900">
                                                {formatPrice(
                                                    request.final_price
                                                )}
                                            </span>

                                        </div>
                                    )}

                            </div>

                        </div>


                        {/* ==================================================
                            LIVE PROVIDER STATUS
                        ================================================== */}

                        <div className="bg-white rounded-2xl shadow-sm border p-5">

                            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">

                                <Radio
                                    size={20}
                                />

                                Live Provider Status

                            </h2>


                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">

                                        <Bike
                                            size={20}
                                            className="text-green-600"
                                        />

                                    </div>


                                    <div>

                                        <p className="font-semibold">

                                            {
                                                request
                                                    .provider
                                                    ?.user
                                                    ?.name ||
                                                request
                                                    .provider
                                                    ?.name ||
                                                "Provider"
                                            }

                                        </p>

                                        <p className="text-sm text-gray-500">

                                            {getStatusText(
                                                request.status
                                            )}

                                        </p>

                                    </div>

                                </div>


                                {locationLoading && (
                                    <Loader2
                                        size={20}
                                        className="animate-spin text-blue-600"
                                    />
                                )}

                            </div>


                            {providerLocation && (
                                <div className="mt-4 bg-blue-50 rounded-xl p-3">

                                    <div className="flex items-center gap-2 text-blue-700">

                                        <Navigation
                                            size={16}
                                        />

                                        <span className="text-sm font-medium">
                                            Live location available
                                        </span>

                                    </div>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Location automatically refreshes every 10 seconds.
                                    </p>

                                </div>
                            )}

                        </div>


                        {/* ==================================================
                            STATUS ACTION
                        ================================================== */}

                        {nextAction && (
                            <div className="bg-white rounded-2xl shadow-sm border p-5">

                                <h2 className="text-lg font-semibold mb-4">
                                    Update Service Status
                                </h2>


                                <button
                                    onClick={() =>
                                        updateStatus(
                                            nextAction.status
                                        )
                                    }
                                    disabled={
                                        updating
                                    }
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >

                                    {updating ? (
                                        <>

                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />

                                            Updating...

                                        </>
                                    ) : (
                                        <>

                                            <nextAction.icon
                                                size={18}
                                            />

                                            {
                                                nextAction.label
                                            }

                                        </>
                                    )}

                                </button>

                            </div>
                        )}

                    </div>


                    {/* ==================================================
                        RIGHT SIDE MAP
                    ================================================== */}

                    <div className="lg:sticky lg:top-24 h-fit">

                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">


                            <div className="p-5 border-b">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <h2 className="text-lg font-semibold flex items-center gap-2">

                                            <Navigation
                                                size={20}
                                            />

                                            Live Map

                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Track provider and customer location
                                        </p>

                                    </div>


                                    {providerLocation && (
                                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">

                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>

                                            Live

                                        </div>
                                    )}

                                </div>

                            </div>


                            <div className="h-[600px]">

                                {customerPosition ? (
                                    <MapContainer
                                        center={
                                            customerPosition
                                        }
                                        zoom={14}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                    >

                                        <TileLayer
                                            attribution='&copy; OpenStreetMap contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />


                                        <MapCenter
                                            position={
                                                currentProviderPosition ||
                                                customerPosition
                                            }
                                        />


                                        {/* CUSTOMER */}

                                        <Marker
                                            position={
                                                customerPosition
                                            }
                                            icon={
                                                customerIcon
                                            }
                                        >

                                            <Popup>

                                                <strong>
                                                    Customer Location
                                                </strong>

                                                <br />

                                                {
                                                    request.address
                                                }

                                            </Popup>

                                        </Marker>


                                        {/* PROVIDER */}

                                        {currentProviderPosition && (
                                            <SmoothProviderMarker
                                                position={
                                                    currentProviderPosition
                                                }
                                            />
                                        )}


                                        {/* ROUTE */}

                                        {routeLine.length ===
                                            2 && (
                                            <Polyline
                                                positions={
                                                    routeLine
                                                }
                                            />
                                        )}

                                    </MapContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gray-100">

                                        <div className="text-center">

                                            <MapPin
                                                size={40}
                                                className="mx-auto text-gray-400 mb-3"
                                            />

                                            <p className="text-gray-500">
                                                Customer location is not available.
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </div>


                            {/* MAP LEGEND */}

                            <div className="p-4 border-t bg-gray-50">

                                <div className="flex items-center gap-5 text-sm">

                                    <div className="flex items-center gap-2">

                                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>

                                        <span>
                                            Provider
                                        </span>

                                    </div>


                                    <div className="flex items-center gap-2">

                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>

                                        <span>
                                            Customer
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProviderRequestDetails;

