<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use App\Models\Provider;
use App\Models\ProviderService;
use Illuminate\Support\Facades\Auth;

class ProviderServiceRequestController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET PROVIDER SERVICE REQUESTS
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $provider = Auth::user()->provider;

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Provider profile not found.',
            ], 404);
        }

        $requests = ServiceRequest::with([
            'customer:id,name,email,phone,address',
            'service:id,name,category,description,base_price',
        ])
            ->where('provider_id', $provider->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'requests' => $requests,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | GET SINGLE SERVICE REQUEST
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $provider = Auth::user()->provider;

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Provider profile not found.',
            ], 404);
        }

        $serviceRequest = ServiceRequest::with([
            'customer:id,name,email,phone,address',
            'service:id,name,category,description,base_price',
            'provider',
        ])
            ->where('provider_id', $provider->id)
            ->find($id);

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Service request not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'request' => $serviceRequest,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ACCEPT SERVICE REQUEST
    |--------------------------------------------------------------------------
    */

   public function accept($id)
{
    $provider = Auth::user()->provider;

    if (!$provider) {
        return response()->json([
            'success' => false,
            'message' => 'Provider profile not found.',
        ], 404);
    }

    /*
    |--------------------------------------------------------------------------
    | Find Service Request
    |--------------------------------------------------------------------------
    */

    $serviceRequest = ServiceRequest::where(
        'provider_id',
        $provider->id
    )->find($id);

    if (!$serviceRequest) {
        return response()->json([
            'success' => false,
            'message' => 'Service request not found.',
        ], 404);
    }

    /*
    |--------------------------------------------------------------------------
    | Only searching requests can be accepted
    |--------------------------------------------------------------------------
    */

    if ($serviceRequest->status !== 'searching') {
        return response()->json([
            'success' => false,
            'message' => 'This service request cannot be accepted.',
        ], 422);
    }

    /*
    |--------------------------------------------------------------------------
    | Get Provider's Service Price
    |--------------------------------------------------------------------------
    */

    $providerService = ProviderService::where(
        'provider_id',
        $provider->id
    )
        ->where(
            'service_id',
            $serviceRequest->service_id
        )
        ->where('is_active', true)
        ->first();

    /*
    |--------------------------------------------------------------------------
    | Provider service not found
    |--------------------------------------------------------------------------
    */

    if (!$providerService) {
        return response()->json([
            'success' => false,
            'message' => 'Provider service price not found.',
        ], 422);
    }

    /*
    |--------------------------------------------------------------------------
    | LOCK BASIC PRICE
    |--------------------------------------------------------------------------
    */

    $basicPrice = (float) $providerService->price;

    /*
    |--------------------------------------------------------------------------
    | Accept Request + Lock Price
    |--------------------------------------------------------------------------
    */

    $serviceRequest->update([
        'status' => 'provider_assigned',

        // Provider's listing price is now locked
        'provider_service_price' => $basicPrice,

        // Initially no extra charges
        'extra_charges' => 0,

        // Initially final price = basic price
        'final_price' => $basicPrice,

        // No approval required until provider adds extra charges
        'price_status' => 'locked',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Increase Provider Job Count
    |--------------------------------------------------------------------------
    */

    $provider->increment('total_jobs');

    /*
    |--------------------------------------------------------------------------
    | Load Relationships
    |--------------------------------------------------------------------------
    */

    $serviceRequest->load([
        'customer:id,name,email,phone,address',
        'service:id,name,category,description,base_price',
        'provider',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Service request accepted and basic price locked successfully.',
        'request' => $serviceRequest,
    ]);
}


    /*
    |--------------------------------------------------------------------------
    | UPDATE SERVICE REQUEST STATUS
    |--------------------------------------------------------------------------
    */

    public function updateStatus(Request $request, $id)
    {
        $provider = Auth::user()->provider;

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Provider profile not found.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:provider_on_the_way,arrived,service_started,service_completed',
            ],
        ]);

        $serviceRequest = ServiceRequest::where(
            'provider_id',
            $provider->id
        )->find($id);

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Service request not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Allowed Status Flow
        |--------------------------------------------------------------------------
        */

        $allowedTransitions = [
            'provider_assigned' => [
                'provider_on_the_way',
            ],

            'provider_on_the_way' => [
                'arrived',
            ],

            'arrived' => [
                'service_started',
            ],

            'service_started' => [
                'service_completed',
            ],
        ];

        $currentStatus = $serviceRequest->status;
        $newStatus = $validated['status'];

        if (
            !isset($allowedTransitions[$currentStatus]) ||
            !in_array(
                $newStatus,
                $allowedTransitions[$currentStatus]
            )
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    "Cannot change status from {$currentStatus} to {$newStatus}.",
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Update Status
        |--------------------------------------------------------------------------
        */

        $serviceRequest->update([
            'status' => $newStatus,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Load Relationships
        |--------------------------------------------------------------------------
        */

        $serviceRequest->load([
            'customer:id,name,email,phone,address',
            'service:id,name,category,description,base_price',
            'provider',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request status updated successfully.',
            'request' => $serviceRequest,
        ]);
    }


 /*
|--------------------------------------------------------------------------
| UPDATE EXTRA CHARGES / FINAL PRICE
|--------------------------------------------------------------------------
|
| Basic provider price remains locked.
| Provider can only add extra charges after checking the actual fault.
|
*/

public function updatePrice(Request $request, $id)
{
    /*
    |--------------------------------------------------------------------------
    | Find logged-in provider
    |--------------------------------------------------------------------------
    */

    $provider = Auth::user()->provider;

    if (!$provider) {
        return response()->json([
            'success' => false,
            'message' => 'Provider profile not found.',
        ], 404);
    }


    /*
    |--------------------------------------------------------------------------
    | Validate extra charges
    |--------------------------------------------------------------------------
    */

    $validated = $request->validate([

        'extra_charges' => [
            'required',
            'numeric',
            'min:0',
        ],

        'extra_charges_reason' => [
            'nullable',
            'string',
            'max:1000',
        ],

    ]);


    /*
    |--------------------------------------------------------------------------
    | Find Provider Booking
    |--------------------------------------------------------------------------
    */

    $serviceRequest = ServiceRequest::where(
        'provider_id',
        $provider->id
    )->find($id);

    if (!$serviceRequest) {
        return response()->json([
            'success' => false,
            'message' => 'Service request not found.',
        ], 404);
    }


    /*
    |--------------------------------------------------------------------------
    | Check Service Status
    |--------------------------------------------------------------------------
    |
    | Provider should first reach customer and check the actual problem.
    |
    */

    if (!in_array($serviceRequest->status, [
        'arrived',
        'service_started',
    ])) {
        return response()->json([
            'success' => false,
            'message' =>
                'Extra charges can be added only after the provider arrives.',
        ], 422);
    }


    /*
    |--------------------------------------------------------------------------
    | Check Locked Basic Price
    |--------------------------------------------------------------------------
    */

    if ($serviceRequest->provider_service_price === null) {
        return response()->json([
            'success' => false,
            'message' =>
                'Basic service price is not locked yet.',
        ], 422);
    }


    /*
    |--------------------------------------------------------------------------
    | Calculate Final Price
    |--------------------------------------------------------------------------
    */

    $lockedBasicPrice =
        (float) $serviceRequest->provider_service_price;

    $extraCharges =
        (float) $validated['extra_charges'];

    $finalPrice =
        $lockedBasicPrice + $extraCharges;


    /*
    |--------------------------------------------------------------------------
    | Update Price
    |--------------------------------------------------------------------------
    */

    $serviceRequest->update([

        // Basic price NEVER changes
        'provider_service_price' =>
            $lockedBasicPrice,

        // Provider's additional charges
        'extra_charges' =>
            $extraCharges,

        // Reason for additional charges
        'extra_charges_reason' =>
            $validated['extra_charges_reason'] ?? null,

        // Basic + Extra
        'final_price' =>
            $finalPrice,

        // Customer must approve new price
        'price_status' =>
            'pending',
    ]);


    /*
    |--------------------------------------------------------------------------
    | Load Relationships
    |--------------------------------------------------------------------------
    */

    $serviceRequest->load([
        'customer:id,name,email,phone,address',
        'service:id,name,category,description,base_price',
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
            'Extra charges updated. Waiting for customer approval.',

        'request' =>
            $serviceRequest,
    ]);
}


    /*
    |--------------------------------------------------------------------------
    | PROVIDER LIVE LOCATION
    |--------------------------------------------------------------------------
    */

    public function liveLocation($id)
    {
        $providerUser = Auth::user();

        // Find provider profile of logged-in user
        $provider = Provider::where(
            'user_id',
            $providerUser->id
        )->first();

        if (!$provider) {
            return response()->json([
                'success' => false,
                'message' => 'Provider profile not found.',
            ], 404);
        }

        // Find request assigned to this provider
        $serviceRequest = ServiceRequest::with('customer')
            ->where('id', $id)
            ->where('provider_id', $provider->id)
            ->first();

        if (!$serviceRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Service request not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,

            'request_status' =>
                $serviceRequest->status,

            'customer_location' => [
                'latitude' =>
                    $serviceRequest->latitude,

                'longitude' =>
                    $serviceRequest->longitude,

                'address' =>
                    $serviceRequest->address,
            ],

            'provider_location' => [
                'provider_id' =>
                    $provider->id,

                'latitude' =>
                    $provider->latitude,

                'longitude' =>
                    $provider->longitude,

                'is_online' =>
                    $provider->is_online,

                'availability_status' =>
                    $provider->availability_status,
            ],
        ]);
    }
}