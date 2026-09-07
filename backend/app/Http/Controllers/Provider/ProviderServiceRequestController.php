<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
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
        | Accept Request
        |--------------------------------------------------------------------------
        */

        $serviceRequest->update([
            'status' => 'provider_assigned',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Increase Provider Job Count
        |--------------------------------------------------------------------------
        */

        $provider->increment('total_jobs');

        $serviceRequest->load([
            'customer:id,name,email,phone,address',
            'service:id,name,category,description,base_price',
            'provider',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request accepted successfully.',
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

}

