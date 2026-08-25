<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminProviderController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceRequestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Test authenticated user
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Customer Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Admin Authentication
Route::post('/admin/login', [AuthController::class, 'adminLogin']);


// Provider Authentication
Route::post('/provider/register', [AuthController::class, 'registerProvider']);
Route::post('/provider/login', [AuthController::class, 'loginProvider']);


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Provider Routes
    |--------------------------------------------------------------------------
    */

    // Select provider services
    Route::post(
        '/provider/services',
        [ProviderController::class, 'selectServices']
    );

    // Upload first verification document
    Route::post(
        '/provider/documents',
        [ProviderController::class, 'uploadDocuments']
    );

    // Get latest provider document
    Route::get(
        '/provider/documents',
        [ProviderController::class, 'documents']
    );

    // Provider profile
    Route::get(
        '/provider/profile',
        [ProviderController::class, 'profile']
    );

    // Update rejected document
    Route::post(
        '/provider/documents/update',
        [ProviderController::class, 'updateDocument']
    );

    // Provider dashboard
    Route::get(
        '/provider/dashboard',
        [ProviderController::class, 'dashboard']
    );


    /*
    |--------------------------------------------------------------------------
    | Logout / User
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    Route::get(
        '/user',
        [AuthController::class, 'me']
    );


    /*
    |--------------------------------------------------------------------------
    | Customer Profile
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/user/profile',
        [CustomerProfileController::class, 'show']
    );

    Route::post(
        '/user/profile/update',
        [CustomerProfileController::class, 'update']
    );


    /*
    |--------------------------------------------------------------------------
    | Services
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/services',
        [ServiceController::class, 'index']
    );

    Route::get(
        '/services/{id}',
        [ServiceController::class, 'show']
    );


    /*
    |--------------------------------------------------------------------------
    | Service Requests
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/service-requests',
        [ServiceRequestController::class, 'store']
    );

    Route::get(
        '/service-requests',
        [ServiceRequestController::class, 'index']
    );

    Route::get(
        '/service-requests/{id}',
        [ServiceRequestController::class, 'show']
    );
});


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Admin Users
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/users',
        [AdminUserController::class, 'index']
    );

    Route::get(
        '/admin/users/stats',
        [AdminUserController::class, 'stats']
    );

    Route::get(
        '/admin/users/{id}',
        [AdminUserController::class, 'show']
    );

    Route::put(
        '/admin/users/{id}/status',
        [AdminUserController::class, 'updateStatus']
    );

    Route::put(
        '/admin/users/{id}/verify',
        [AdminUserController::class, 'updateVerification']
    );

    Route::delete(
        '/admin/users/{id}',
        [AdminUserController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Admin Providers
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/providers',
        [AdminProviderController::class, 'index']
    );

    Route::get(
        '/admin/providers/{id}',
        [AdminProviderController::class, 'show']
    );

    Route::post(
        '/admin/providers/{id}/approve',
        [AdminProviderController::class, 'approve']
    );

    Route::post(
        '/admin/providers/{id}/reject',
        [AdminProviderController::class, 'reject']
    );
});