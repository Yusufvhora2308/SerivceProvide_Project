<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Auth;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{

    //current user requests
    public function index(Request $request)
    {
        $serviceRequests = ServiceRequest::with('service')
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $serviceRequests,
        ]);
    }

    //store requests
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'problem_description' => 'nullable|string|max:2000',
            'request_type' => 'required|in:now,scheduled',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        $serviceRequest = ServiceRequest::create([
            'customer_id' => Auth::id(),
            'service_id' => $validated['service_id'],
            'address' => $validated['address'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'problem_description' => $validated['problem_description'] ?? null,
            'request_type' => $validated['request_type'],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'status' => 'searching',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service request created successfully.',
            'data' => $serviceRequest,
        ], 201);
    }

    // view request
    public function show(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::with('service')
            ->where('customer_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $serviceRequest,
        ]);
    }
}
