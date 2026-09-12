<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ServiceRequestController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | CREATE SERVICE REQUEST
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $customer = Auth::user();

        // Validation
        $validated = $request->validate([
            'service_id' => [
                'required',
                'integer',
                'exists:services,id',
            ],

            'provider_id' => [
                'required',
                'integer',
                'exists:providers,id',
            ],

            'address' => [
                'required',
                'string',
                'max:500',
            ],

            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'problem_description' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'request_type' => [
                'required',
                Rule::in([
                    'now',
                    'scheduled',
                ]),
            ],

            'scheduled_at' => [
                'nullable',
                'date',
                'after:now',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Scheduled validation
        |--------------------------------------------------------------------------
        */

        if (
            $validated['request_type'] === 'scheduled'
            && empty($validated['scheduled_at'])
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Scheduled date and time is required.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Instant request
        |--------------------------------------------------------------------------
        */

        if ($validated['request_type'] === 'now') {
            $validated['scheduled_at'] = null;
        }

        /*
        |--------------------------------------------------------------------------
        | Check Service
        |--------------------------------------------------------------------------
        */

        $service = Service::find($validated['service_id']);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Create Request
        |--------------------------------------------------------------------------
        */

        $serviceRequest = ServiceRequest::create([
            'customer_id' => $customer->id,

            'provider_id' => $validated['provider_id'],

            'service_id' => $validated['service_id'],

            'address' => $validated['address'],

            'latitude' => $validated['latitude'],

            'longitude' => $validated['longitude'],

            'problem_description' =>
                $validated['problem_description'] ?? null,

            'request_type' =>
                $validated['request_type'],

            'scheduled_at' =>
                $validated['scheduled_at'] ?? null,

            'status' => 'searching',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Load relationships
        |--------------------------------------------------------------------------
        */

        $serviceRequest->load([
            'service',
            'customer',
            'provider',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Service request created successfully.',

            'service_request' =>
                $serviceRequest,
        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER REQUEST LIST
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $customer = Auth::user();

        $requests = ServiceRequest::with([
            'service',
            'provider',
        ])
            ->where(
                'customer_id',
                $customer->id
            )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,

            'service_requests' =>
                $requests,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER REQUEST DETAIL
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $customer = Auth::user();

        $serviceRequest =
            ServiceRequest::with([
                'service',
                'customer',
                'provider',
            ])
            ->where(
                'customer_id',
                $customer->id
            )
            ->find($id);

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Service request not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,

            'service_request' =>
                $serviceRequest,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CANCEL REQUEST
    |--------------------------------------------------------------------------
    */

    public function cancel($id)
    {
        $customer = Auth::user();

        $serviceRequest =
            ServiceRequest::where(
                'customer_id',
                $customer->id
            )->find($id);

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Service request not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Check if already completed/cancelled
        |--------------------------------------------------------------------------
        */

        if (
            $serviceRequest->status === 'service_completed'
            || $serviceRequest->status === 'cancelled'
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'This request cannot be cancelled.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Cancel
        |--------------------------------------------------------------------------
        */

        $serviceRequest->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'success' => true,

            'message' =>
                'Service request cancelled successfully.',

            'service_request' =>
                $serviceRequest,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | PROVIDER LIVE LOCATION
    |--------------------------------------------------------------------------
    */

    public function providerLocation($id)
    {
        $customer = Auth::user();

        $serviceRequest = ServiceRequest::with('provider')
            ->where('id', $id)
            ->where('customer_id', $customer->id)
            ->first();

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Service request not found.',
            ], 404);
        }

        if (!$serviceRequest->provider) {
            return response()->json([
                'success' => true,

                'provider_location' => null,

                'message' =>
                    'Provider is not assigned yet.',
            ]);
        }

        return response()->json([
            'success' => true,

            'provider_location' => [
                'provider_id' =>
                    $serviceRequest->provider->id,

                'latitude' =>
                    $serviceRequest->provider->latitude,

                'longitude' =>
                    $serviceRequest->provider->longitude,

                'is_online' =>
                    $serviceRequest->provider->is_online,

                'availability_status' =>
                    $serviceRequest->provider->availability_status,
            ],

            'request_status' =>
                $serviceRequest->status,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | APPROVE FINAL PRICE
    |--------------------------------------------------------------------------
    */

    public function approvePrice($id)
    {
        $customer = Auth::user();

        /*
        |----------------------------------------------------------------------
        | Find customer's request
        |----------------------------------------------------------------------
        */

        $serviceRequest = ServiceRequest::where(
            'id',
            $id
        )
            ->where(
                'customer_id',
                $customer->id
            )
            ->first();

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Service request not found.',
            ], 404);
        }

        /*
        |----------------------------------------------------------------------
        | Check price status
        |----------------------------------------------------------------------
        */

        if ($serviceRequest->price_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' =>
                    'There is no pending price for approval.',
            ], 422);
        }

        /*
        |----------------------------------------------------------------------
        | Approve price
        |----------------------------------------------------------------------
        */

        $serviceRequest->update([
            'price_status' => 'approved',
        ]);

        /*
        |----------------------------------------------------------------------
        | Load relationships
        |----------------------------------------------------------------------
        */

        $serviceRequest->load([
            'service',
            'provider',
        ]);

        return response()->json([
            'success' => true,

            'message' =>
                'Final price approved successfully.',

            'service_request' =>
                $serviceRequest,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | REJECT FINAL PRICE
    |--------------------------------------------------------------------------
    */

    public function rejectPrice($id)
    {
        $customer = Auth::user();

        /*
        |----------------------------------------------------------------------
        | Find customer's request
        |----------------------------------------------------------------------
        */

        $serviceRequest = ServiceRequest::where(
            'id',
            $id
        )
            ->where(
                'customer_id',
                $customer->id
            )
            ->first();

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Service request not found.',
            ], 404);
        }

        /*
        |----------------------------------------------------------------------
        | Check price status
        |----------------------------------------------------------------------
        */

        if ($serviceRequest->price_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' =>
                    'There is no pending price to reject.',
            ], 422);
        }

        /*
        |----------------------------------------------------------------------
        | Reject price
        |----------------------------------------------------------------------
        */

        $serviceRequest->update([
            'price_status' => 'rejected',
        ]);

        /*
        |----------------------------------------------------------------------
        | Load relationships
        |----------------------------------------------------------------------
        */

        $serviceRequest->load([
            'service',
            'provider',
        ]);

        return response()->json([
            'success' => true,

            'message' =>
                'Final price rejected.',

            'service_request' =>
                $serviceRequest,
        ]);
    }
}

