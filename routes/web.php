<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    Route::get('/', fn () => Inertia::render('Home/Index'))->name('home');

    // Resep
    Route::get('/recipes', fn () => Inertia::render('Recipe/Index'))->name('recipes.index');
    Route::get('/recipes/{slug}', fn ($slug) => Inertia::render('Recipe/Show', ['slug' => $slug]))->name('recipes.show');

    // Toko
    Route::get('/store', fn () => Inertia::render('Store/Index'))->name('store.index');

    // Keranjang
    Route::get('/cart', fn () => Inertia::render('Cart/Index'))->name('cart.index');

    // Checkout
    Route::get('/checkout/payment', fn () => Inertia::render('Checkout/Payment'))->name('checkout.payment');
    Route::get('/checkout/success', fn () => Inertia::render('Checkout/Success'))->name('checkout.success');

    // Profil
    Route::get('/profile', fn () => Inertia::render('Profile/Index'))->name('profile.index');
});
