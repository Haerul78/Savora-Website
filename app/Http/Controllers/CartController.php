<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $user = session('supabase_user');
        $userId = is_array($user) ? ($user['id'] ?? null) : ($user?->id);

        if (!$userId) {
            return redirect()->route('login');
        }

        $cartItems = CartItem::where('user_id', $userId)
            ->with(['product', 'recipe'])
            ->get();

        $grouped = [];
        foreach ($cartItems as $item) {
            $recipeId = $item->recipe_id ?: 'kitchen_needs';
            $recipeTitle = $item->recipe ? ('Bahan untuk "' . $item->recipe->title . '"') : 'Kebutuhan Dapur';

            if (!isset($grouped[$recipeId])) {
                $grouped[$recipeId] = [
                    'recipe_id' => $item->recipe_id,
                    'title'     => $recipeTitle,
                    'items'     => []
                ];
            }

            $grouped[$recipeId]['items'][] = [
                'id'         => $item->id,
                'product_id' => $item->product_id,
                'recipe_id'  => $item->recipe_id,
                'quantity'   => $item->quantity,
                'product'    => $item->product ? [
                    'id'          => $item->product->id,
                    'name'        => $item->product->name,
                    'price'       => $item->product->price,
                    'stock'       => $item->product->stock,
                    'unit'        => $item->product->unit,
                    'image_url'   => $item->product->image_url,
                ] : null,
            ];
        }

        // Re-index array for frontend mapping
        $groupedCart = array_values($grouped);

        return Inertia::render('Cart/Index', [
            'groupedCart' => $groupedCart,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'recipe_id'  => 'nullable|exists:recipes,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $user = session('supabase_user');
        $userId = is_array($user) ? ($user['id'] ?? null) : ($user?->id);

        if (!$userId) {
            return back()->with('error', 'Silakan login terlebih dahulu.');
        }

        $product = Product::findOrFail($request->product_id);
        $qtyToAdd = $request->quantity;

        // Check if there is enough stock
        if ($product->stock < $qtyToAdd) {
            return back()->with('error', 'Stok tidak mencukupi.');
        }

        $existing = CartItem::where('user_id', $userId)
            ->where('product_id', $request->product_id)
            ->where('recipe_id', $request->recipe_id)
            ->first();

        if ($existing) {
            if ($product->stock < ($existing->quantity + $qtyToAdd)) {
                return back()->with('error', 'Kuantitas melebihi stok yang tersedia.');
            }
            $existing->increment('quantity', $qtyToAdd);
        } else {
            CartItem::create([
                'id'         => (string) Str::uuid(),
                'user_id'    => $userId,
                'product_id' => $request->product_id,
                'recipe_id'  => $request->recipe_id,
                'quantity'   => $qtyToAdd,
            ]);
        }

        return back()->with('success', 'Bahan berhasil ditambahkan ke keranjang.');
    }

    public function update(Request $request, CartItem $cartItem)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = session('supabase_user');
        $userId = is_array($user) ? ($user['id'] ?? null) : ($user?->id);

        if (!$userId || $cartItem->user_id !== $userId) {
            return back()->with('error', 'Akses ditolak.');
        }

        $product = Product::findOrFail($cartItem->product_id);
        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Stok produk tidak mencukupi.');
        }

        $cartItem->update([
            'quantity' => $request->quantity
        ]);

        return back()->with('success', 'Keranjang berhasil diperbarui.');
    }

    public function destroy(CartItem $cartItem)
    {
        $user = session('supabase_user');
        $userId = is_array($user) ? ($user['id'] ?? null) : ($user?->id);

        if (!$userId || $cartItem->user_id !== $userId) {
            return back()->with('error', 'Akses ditolak.');
        }

        $cartItem->delete();

        return back()->with('success', 'Barang berhasil dihapus dari keranjang.');
    }
}
