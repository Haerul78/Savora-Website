<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;
use Midtrans\Transaction;

class CheckoutController extends Controller
{
    public function __construct()
    {
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized = config('midtrans.is_sanitized');
        MidtransConfig::$is3ds = config('midtrans.is_3ds');

        // Nonaktifkan verifikasi SSL cURL khusus local dev (Windows sering tidak
        // punya CA bundle terpasang), sama seperti perlakuan SupabaseService.
        // CURLOPT_HTTPHEADER wajib diisi non-kosong di sini karena Midtrans SDK
        // mengganti seluruh header asli (termasuk Authorization) jika key ini kosong.
        if (app()->environment('local')) {
            MidtransConfig::$curlOptions = [
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_HTTPHEADER      => ['X-Requested-With: XMLHttpRequest'],
            ];
        }
    }

    public function payment(Request $request)
    {
        $userId = $this->currentUserId();

        $cartItems = CartItem::where('user_id', $userId)->with('product')->get();

        if ($cartItems->isEmpty() && !session('orderId')) {
            return redirect()->route('cart.index')->with('error', 'Keranjang kosong.');
        }

        $addresses = Address::where('user_id', $userId)->orderByDesc('is_primary')->get();

        $subtotal = $cartItems->sum(fn ($item) => $item->product->price * $item->quantity);

        return Inertia::render('Checkout/Payment', [
            'cartItems' => $cartItems,
            'addresses' => $addresses,
            'subtotal'  => $subtotal,
            'snapToken' => session('snapToken'),
            'orderId'   => session('orderId'),
        ]);
    }

    public function process(Request $request)
    {
        $request->validate([
            'address_id' => 'required|exists:addresses,id',
        ]);

        $userId = $this->currentUserId();

        $address = Address::where('id', $request->address_id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $cartItems = CartItem::where('user_id', $userId)->with('product')->get();

        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Keranjang kosong.');
        }

        $order = DB::transaction(function () use ($cartItems, $userId, $address) {
            $subtotal = $cartItems->sum(fn ($item) => $item->product->price * $item->quantity);
            $deliveryFee = 0;
            $discount = 0;

            $order = Order::create([
                'id'           => (string) Str::uuid(),
                'user_id'      => $userId,
                'address_id'   => $address->id,
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'status'       => 'pending',
                'subtotal'     => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount'     => $discount,
                'total'        => $subtotal + $deliveryFee - $discount,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'id'                => (string) Str::uuid(),
                    'order_id'          => $order->id,
                    'product_id'        => $item->product_id,
                    'recipe_id'         => $item->recipe_id,
                    'product_name'      => $item->product->name,
                    'product_image'     => $item->product->image_url,
                    'price_at_purchase' => $item->product->price,
                    'quantity'          => $item->quantity,
                    'subtotal'          => $item->product->price * $item->quantity,
                ]);
            }

            return $order;
        });

        $snapToken = Snap::getSnapToken([
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => [
                'first_name' => $address->recipient_name,
                'phone'      => $address->phone,
            ],
            // Redirect per-transaksi ini tidak divalidasi Midtrans seperti
            // Finish/Error URL global di Snap Preferences, jadi localhost aman dipakai di sini.
            'callbacks' => [
                'finish' => route('checkout.success', ['order_id' => $order->id]),
            ],
        ]);

        Payment::create([
            'id'             => (string) Str::uuid(),
            'order_id'       => $order->id,
            'user_id'        => $userId,
            'status'         => 'pending',
            'amount'         => $order->total,
            'midtrans_token' => $snapToken,
        ]);

        return redirect()->route('checkout.payment')
            ->with('orderId', $order->id)
            ->with('snapToken', $snapToken);
    }

    public function callback(Request $request)
    {
        $notification = new \Midtrans\Notification();

        $order = Order::where('order_number', $notification->order_id)
            ->with('payment')
            ->first();

        if (!$order || !$order->payment) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $this->applyTransactionStatus(
            $order,
            $notification->transaction_status,
            $notification->fraud_status ?? null,
            $notification->transaction_id ?? null
        );

        return response()->json(['message' => 'OK']);
    }

    // Dipanggil dari halaman sukses & tombol "Cek Status" — tanya langsung ke
    // Midtrans API (outbound), jadi tidak bergantung pada webhook yang butuh
    // server bisa diakses publik (cocok untuk dev di localhost).
    public function checkStatus(Request $request, Order $order)
    {
        abort_unless($order->user_id === $this->currentUserId(), 403);

        $order->load('payment');
        $this->syncPaymentStatus($order);

        return back()->with('success', 'Status pembayaran diperbarui.');
    }

    private function syncPaymentStatus(Order $order): void
    {
        $order->loadMissing('payment');

        if (!$order->payment || $order->payment->status !== 'pending') {
            return;
        }

        try {
            $result = Transaction::status($order->order_number);
        } catch (\Exception $e) {
            return;
        }

        $this->applyTransactionStatus(
            $order,
            $result->transaction_status,
            $result->fraud_status ?? null,
            $result->transaction_id ?? null
        );
    }

    private function applyTransactionStatus(Order $order, string $status, ?string $fraud, ?string $transactionId): void
    {
        if ($status === 'capture' && $fraud === 'accept') {
            $status = 'settlement';
        }

        if ($status === 'settlement') {
            DB::transaction(function () use ($order, $transactionId) {
                $order->payment->update([
                    'status'         => 'success',
                    'transaction_id' => $transactionId,
                    'paid_at'        => now(),
                ]);
                $order->update(['status' => 'confirmed']);
                $this->decrementStock($order);
                CartItem::where('user_id', $order->user_id)->delete();
            });
        } elseif ($status === 'pending') {
            $order->payment->update(['status' => 'pending']);
        } elseif (in_array($status, ['deny', 'cancel', 'expire'])) {
            // Payments punya kolom status yang lebih rinci (failed/cancelled/expired),
            // sedangkan orders cuma punya "cancelled" untuk semua kegagalan.
            $paymentStatus = match ($status) {
                'deny'   => 'failed',
                'cancel' => 'cancelled',
                'expire' => 'expired',
            };

            $order->payment->update([
                'status'         => $paymentStatus,
                'failure_reason' => $status,
            ]);
            $order->update(['status' => 'cancelled']);
        }
    }

    public function success(Request $request)
    {
        $userId = $this->currentUserId();
        $orderId = $request->query('order_id');

        // Midtrans redirect (Finish Redirect URL) mengirim order_number
        // (mis. ORD-XXXX), sedangkan link internal kita pakai UUID order.
        $order = Order::where('user_id', $userId)
            ->where(fn ($query) => $query->where('id', $orderId)->orWhere('order_number', $orderId))
            ->with(['items', 'payment'])
            ->firstOrFail();

        $this->syncPaymentStatus($order);
        $order->refresh()->load(['items', 'payment']);

        // Clear cart if order is confirmed (paid)
        if ($order->status === 'confirmed') {
            CartItem::where('user_id', $userId)->delete();
        }

        return Inertia::render('Checkout/Success', [
            'order' => $order,
        ]);
    }

    private function currentUserId(): ?string
    {
        $user = session('supabase_user');
        return is_array($user) ? ($user['id'] ?? null) : ($user?->id);
    }

    private function decrementStock(Order $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            Product::where('id', $item->product_id)->decrement('stock', $item->quantity);
        }
    }

    public function storeAddress(Request $request)
    {
        $request->validate([
            'label'          => 'required|string|max:100',
            'recipient_name' => 'required|string|max:255',
            'phone'          => 'required|string|max:50',
            'full_address'   => 'required|string',
            'city'           => 'required|string|max:100',
            'province'       => 'required|string|max:100',
            'postal_code'    => 'required|string|max:20',
        ]);

        $userId = $this->currentUserId();

        $hasPrimary = Address::where('user_id', $userId)->where('is_primary', true)->exists();
        $isPrimary = !$hasPrimary || $request->boolean('is_primary');

        if ($isPrimary) {
            Address::where('user_id', $userId)->update(['is_primary' => false]);
        }

        Address::create([
            'id'             => (string) Str::uuid(),
            'user_id'        => $userId,
            'label'          => $request->label,
            'recipient_name' => $request->recipient_name,
            'phone'          => $request->phone,
            'full_address'   => $request->full_address,
            'city'           => $request->city,
            'province'       => $request->province,
            'postal_code'    => $request->postal_code,
            'is_primary'     => $isPrimary,
        ]);

        return back()->with('success', 'Alamat berhasil ditambahkan.');
    }

    public function mockPay(Request $request)
    {
        if (!app()->environment('local')) {
            abort(404);
        }

        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $userId = $this->currentUserId();
        $order = Order::where('id', $request->order_id)
            ->where('user_id', $userId)
            ->with('payment')
            ->firstOrFail();

        DB::transaction(function () use ($order, $userId) {
            if ($order->payment) {
                $order->payment->update([
                    'status'         => 'success',
                    'transaction_id' => 'MOCK-' . strtoupper(Str::random(12)),
                    'paid_at'        => now(),
                ]);
            }
            $order->update(['status' => 'confirmed']);
            $this->decrementStock($order);

            CartItem::where('user_id', $userId)->delete();
        });

        return redirect()->route('checkout.success', ['order_id' => $order->id])
            ->with('success', 'Pembayaran berhasil disimulasikan!');
    }
}
