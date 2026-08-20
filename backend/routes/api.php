<?php

use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\ProviderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//user register
Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::post('/admin/login', [AuthController::class, 'adminLogin']); // Admin login endpoint

//provider registration
Route::post('/provider/register', [AuthController::class, 'registerProvider']);
Route::post('/provider/services', [ProviderController::class, 'selectServices']);
Route::post('/provider/documents', [ProviderController::class, 'uploadDocuments']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/provider/dashboard', [ProviderController::class,'dashboard']);

});


//Customer Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::post('/service-requests', [ServiceRequestController::class, 'store']);
    Route::get('/service-requests', [ServiceRequestController::class, 'index']);
    Route::get('/service-requests/{id}', [ServiceRequestController::class, 'show']);
});



