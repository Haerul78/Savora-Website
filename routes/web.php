<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\SavedRecipeController;
use App\Http\Controllers\CartBulkController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Public webhook (dipanggil server Midtrans, bukan user login) ─────────────
Route::post('/checkout/callback', [CheckoutController::class, 'callback'])->name('checkout.callback');

// ─── Guest routes (hanya bisa diakses jika belum login) ───────────────────────
Route::middleware('supabase.guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// ─── Protected routes (butuh login via Supabase) ──────────────────────────────
Route::middleware('supabase.auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Home
    Route::get('/', [HomeController::class, 'index'])->name('home');

    // Resep
    Route::get('/recipes', [RecipeController::class, 'index'])->name('recipes.index');
    Route::get('/recipes/{slug}', [RecipeController::class, 'show'])->name('recipes.show');
    Route::post('/recipes/{recipe}/save', [SavedRecipeController::class, 'toggle'])->name('recipes.save');

    // Toko
    Route::get('/store', [StoreController::class, 'index'])->name('store.index');

    // Keranjang
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');
    Route::post('/cart/bulk', [CartBulkController::class, 'store'])->name('cart.bulk');

    // Checkout
    Route::get('/checkout/payment', [CheckoutController::class, 'payment'])->name('checkout.payment');
    Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
    Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::post('/checkout/mock-pay', [CheckoutController::class, 'mockPay'])->name('checkout.mock-pay');

    // Alamat
    Route::post('/addresses', [CheckoutController::class, 'storeAddress'])->name('addresses.store');

    // Profil
    Route::get('/profile', fn () => Inertia::render('Profile/Index'))->name('profile.index');
});
