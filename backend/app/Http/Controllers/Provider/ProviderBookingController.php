<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\ServiceRequest;
use Illuminate\Support\Facades\Auth;

class ProviderBookingController extends Controller
{
    /**
     * Get completed and cancelled bookings
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

        $bookings = ServiceRequest::with([
            'customer:id,name,email,phone,address',
            'service:id,name,category,description,base_price',
        ])
            ->where('provider_id', $provider->id)
            ->whereIn('status', [
                'service_completed',
                'completed',
                'cancelled',
            ])
            ->latest('updated_at')
            ->get();

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Get single completed/cancelled booking
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

        $booking = ServiceRequest::with([
            'customer:id,name,email,phone,address',
            'service:id,name,category,description,base_price',
            'provider.user:id,name,email,phone',
        ])
            ->where('provider_id', $provider->id)
            ->whereIn('status', [
                'service_completed',
                'completed',
                'cancelled',
            ])
            ->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'booking' => $booking,
        ]);
    }
}