<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/supabase-test', function () {
    return Inertia::render('SupabaseTest');
});

Route::get('/midtrans-test', function () {
    return Inertia::render('MidtransTest');
});

Route::get('/layout-test', function () {
    return Inertia::render('LayoutTest');
});

Route::post('/midtrans-test/ping', function () {
    \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
    \Midtrans\Config::$isProduction = false;
    \Midtrans\Config::$isSanitized = true;
    \Midtrans\Config::$is3ds = true;
    \Midtrans\Config::$curlOptions = [CURLOPT_SSL_VERIFYPEER => false, CURLOPT_HTTPHEADER => []];

    $params = [
        'transaction_details' => [
            'order_id'     => 'test-' . time(),
            'gross_amount' => 10000,
        ],
        'customer_details' => [
            'first_name' => 'Test',
            'email'      => 'test@savora.com',
        ],
    ];

    try {
        $snapToken = \Midtrans\Snap::getSnapToken($params);
        return response()->json(['success' => true, 'snap_token' => $snapToken]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});
