<?php

use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\JwtMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Routes Publiques ---
Route::post('/login', [AuthController::class, 'login']);
Route::get('/utilisateur/ping', [UtilisateurController::class, 'ping']);
Route::get('/material/ping', [MaterialController::class, 'ping']);
Route::post('/utilisateur', [UtilisateurController::class, 'store']);

// Route de diagnostic Pulse/JWT
Route::get('/config/jwt', function () {
    return response()->json([
        'jwt_enabled' => config('jwt.enabled'),
        'status' => 'OK'
    ]);
});

$middleware = config('jwt.enabled') ? [JwtMiddleware::class] : [];

Route::middleware($middleware)->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('client', ClientController::class)->parameters(['client' => 'customer']);
    Route::apiResource('material', MaterialController::class)->parameters(['material' => 'material']);
    Route::apiResource('sale', SaleController::class)->parameters(['sale' => 'sale']);
    Route::apiResource('ticket', TicketController::class)->parameters(['ticket' => 'ticket']);
    Route::apiResource('utilisateur', UtilisateurController::class)
        ->parameters(['utilisateur' => 'user'])
        ->except(['store']);
    Route::apiResource('promotion', PromotionController::class)->parameters(['promotion' => 'promotion']);

    Route::post('promotion/validate-coupon', [PromotionController::class, 'validateCoupon'])->name('promotion.validate-coupon');
    Route::get('material/{material}/promotion', [PromotionController::class, 'materialPromotion'])->name('material.promotion');

    Route::post('sale/{sale}/invoice/{country}', [InvoiceController::class, 'generate'])
        ->where('country', '[a-zA-Z]{2}')
        ->name('sale.invoice.generate');
    Route::get('sale/{sale}/invoice/{country}/download', [InvoiceController::class, 'download'])
        ->where('country', '[a-zA-Z]{2}')
        ->name('sale.invoice.download');
});

