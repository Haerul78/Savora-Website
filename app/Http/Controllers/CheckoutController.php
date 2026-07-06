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

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang kosong.');
        }

        $addresses = Address::where('user_id', $userId)->orderByDesc('is_primary')->get();

        $subtotal = $cartItems->sum(fn ($item) => $item->product->price * $item->quantity);

        return Inertia::render('Checkout/Payment', [
            'cartItems' => $cartItems,
            'addresses' => $addresses,
            'subtotal'  => $subtotal,
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

    public function success(Request $request)
    {
        $userId = $this->currentUserId();
        $order = Order::where('user_id', $userId)
            ->with(['items', 'payment'])
            ->findOrFail($request->query('order_id'));

        return Inertia::render('Checkout/Success', [
            'order' => $order,
        ]);
    }

    private function currentUserId(): ?string
    {
        $user = session('supabase_user');
        return is_array($user) ? ($user['id'] ?? null) : ($user?->id);
    }
}
