<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\TokenController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


Route::post("/save", [TokenController::class, 'store']);
Route::post("/sendOtp", [UserController::class, 'sendOtp']);
Route::post("/verifyOtp", [UserController::class, 'verifyOtp']);
Route::post('/login', [UserController::class, 'login']);
Route::get("/brand", [BrandController::class, 'get']);


Route::middleware(['auth:sanctum', 'abilities:admin'])->group(function () {
    Route::get('/allUsers', [UserController::class, 'allUsers']);
    // Route::post('/createAdmin', [UserController::class, 'store']);
    Route::post('/createUser', [UserController::class, 'store']);
    Route::get('/getUserToken/{id}', [UserController::class, 'getUserToken']);
    Route::post('/delete/{id}', [UserController::class, 'destroy']);
    // // Route::get('/allUsers', [UserController::class, 'allUsers']);


    // Route::get("/response/{token}", [TokenController::class, 'getTokenResponse']);

    // //model
    // // model/deleted/:id
    Route::post("/brand", [BrandController::class, 'create']);
    Route::put("/brand", [BrandController::class, 'update']);
    Route::delete("/brand/{id}", [BrandController::class, 'delete']);
    Route::get("/brand/deleted", [BrandController::class, 'deletedModel']);
    Route::post("/brand/restore/{id}", [BrandController::class, 'restore']);
    Route::delete("/brand/deleted/{id}", [BrandController::class, 'hardDelete']);


    Route::post("/update", [UserController::class, 'update']);
    // Route::post("/password", [UserController::class, 'password']);
    Route::get('/allUserData', [UserController::class, 'allUserData']);
    Route::get('/allUser', [UserController::class, 'allUser']);
    // Route::get('/export', [UserController::class, 'exportData']);
});

// Route::middleware(['auth:sanctum', 'abilities:user'])->group(function () {
//     Route::get("/me", [UserController::class, 'getUserResponse']);
//     Route::post("/lead", [LeadController::class, 'create']);
// });

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get("/tracking", [UserController::class, 'report']);
    Route::get("/lead/{id}", [LeadController::class, 'get']);
    Route::get('/export', [App\Http\Controllers\TokenController::class, 'export']);

});