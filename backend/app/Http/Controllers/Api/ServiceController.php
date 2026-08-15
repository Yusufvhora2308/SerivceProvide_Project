<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    public function show($id)
    {
        $service = Service::where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $service,
        ]);
    }
}
