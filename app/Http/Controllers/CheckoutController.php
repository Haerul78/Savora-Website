<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class CheckoutController extends Controller
{
    public function __construct()
    {
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized = config('midtrans.is_sanitized');
        MidtransConfig::$is3ds = config('midtrans.is_3ds');
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

        $status = $notification->transaction_status;
        $fraud = $notification->fraud_status ?? null;

        if ($status === 'capture' && $fraud === 'accept') {
            $status = 'settlement';
        }

        if ($status === 'settlement') {
            $order->payment->update([
                'status'         => 'paid',
                'transaction_id' => $notification->transaction_id,
                'paid_at'        => now(),
            ]);
            $order->update(['status' => 'paid']);
            CartItem::where('user_id', $order->user_id)->delete();
        } elseif ($status === 'pending') {
            $order->payment->update(['status' => 'pending']);
        } elseif (in_array($status, ['deny', 'cancel', 'expire'])) {
            $order->payment->update([
                'status'         => 'failed',
                'failure_reason' => $status,
            ]);
            $order->update(['status' => 'failed']);
        }

        return response()->json(['message' => 'OK']);
    }

    public function success(Request $request)
    {
        $userId = $this->currentUserId();
        $order = Order::where('user_id', $userId)
            ->with(['items', 'payment'])
            ->findOrFail($request->query('order_id'));

        // Clear cart if order is paid or confirmed
        if (in_array($order->status, ['paid', 'confirmed'])) {
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
                    'status'         => 'paid',
                    'transaction_id' => 'MOCK-' . strtoupper(Str::random(12)),
                    'paid_at'        => now(),
                ]);
            }
            $order->update(['status' => 'paid']);

            CartItem::where('user_id', $userId)->delete();
        });

        return redirect()->route('checkout.success', ['order_id' => $order->id])
            ->with('success', 'Pembayaran berhasil disimulasikan!');
    }
}
