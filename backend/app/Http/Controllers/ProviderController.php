<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    //services choose
    public function selectServices(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'integer|exists:services,id',
        ]);

        $provider = Provider::where(
            'user_id',
            $validated['user_id']
        )->firstOrFail();

        $provider->services()->sync(
            $validated['service_ids']
        );

        return response()->json([
            'success' => true,
            'message' => 'Services selected successfully.',
            'services' => $provider->services,
        ]);
    }

    //documanet upload
    public function uploadDocuments(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'document_type' => 'required|string|max:100',
            'document_number' => 'nullable|string|max:100',
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10120',
        ]);

        $provider = Provider::where(
            'user_id',
            $validated['user_id']
        )->firstOrFail();

        $path = $request->file('file')->store(
            'provider-documents',
            'public'
        );

        $document = $provider->documents()->create([
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'] ?? null,
            'document_file' => $path,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully.',
            'document' => $document,
        ], 201);
    }

    //provider dashboard info
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $provider = Provider::with([
            'user',
            'services',
            'documents',
        ])->where('user_id', $user->id)->firstOrFail();

        return response()->json([
            'success' => true,

            'provider' => [
                'id' => $provider->id,
                'name' => $provider->user->name,
                'phone' => $provider->user->phone,
                'profile_image' => $provider->profile_image,

                'verification_status' =>
                    $provider->verification_status,

                'is_online' =>
                    $provider->is_online,

                'availability_status' =>
                    $provider->availability_status,

                'latitude' =>
                    $provider->latitude,

                'longitude' =>
                    $provider->longitude,

                'rating' =>
                    $provider->rating,

                'total_jobs' =>
                    $provider->total_jobs,

                'services' =>
                    $provider->services,

                'documents' =>
                    $provider->documents,
            ],
        ]);
    }
}