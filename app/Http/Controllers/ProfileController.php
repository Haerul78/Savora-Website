<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\Review;
use App\Models\SavedRecipe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $userId = $this->currentUserId();

        $addresses = Address::where('user_id', $userId)
            ->orderByDesc('is_primary')
            ->get();

        $stats = $this->getProfileStats($userId);

        return Inertia::render('Profile/Index', [
            'addresses' => $addresses,
            'stats'     => $stats,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'phone'     => 'nullable|string|max:50',
        ]);

        $userId = $this->currentUserId();

        $user = User::findOrFail($userId);
        $user->update([
            'full_name' => $request->full_name,
            'phone'     => $request->phone,
        ]);

        // Sync session user
        $sessionUser = session('supabase_user');
        if (is_array($sessionUser)) {
            $sessionUser['full_name'] = $request->full_name;
            $sessionUser['phone'] = $request->phone;
        } else if ($sessionUser) {
            $sessionUser->full_name = $request->full_name;
            $sessionUser->phone = $request->phone;
        }
        session(['supabase_user' => $sessionUser]);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $userId = $this->currentUserId();
        $user = User::findOrFail($userId);

        // Delete old avatar if uploaded locally
        if ($user->avatar_url && str_contains($user->avatar_url, '/storage/avatars/')) {
            $oldPath = 'avatars/' . basename($user->avatar_url);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        // Store new avatar file
        $path = $request->file('avatar')->store('avatars', 'public');
        $avatarUrl = asset('storage/' . $path);

        $user->update([
            'avatar_url' => $avatarUrl,
        ]);

        // Sync session user
        $sessionUser = session('supabase_user');
        if (is_array($sessionUser)) {
            $sessionUser['avatar_url'] = $avatarUrl;
        } else if ($sessionUser) {
            $sessionUser->avatar_url = $avatarUrl;
        }
        session(['supabase_user' => $sessionUser]);

        return back()->with('success', 'Foto profil berhasil diperbarui.');
    }

    public function paymentHistory(Request $request)
    {
        $userId = $this->currentUserId();
        $status = $request->query('status', 'all');

        $query = Order::where('user_id', $userId)
            ->with(['items', 'payment'])
            ->orderByDesc('created_at');

        if ($status === 'success') {
            $query->where(fn($q) => 
                $q->where('status', 'paid')
                  ->orWhereHas('payment', fn($p) => $p->where('status', 'paid'))
            );
        } elseif ($status === 'pending') {
            $query->where('status', 'pending')
                  ->whereHas('payment', fn($p) => $p->where('status', 'pending'));
        } elseif ($status === 'failed') {
            $query->where(fn($q) => 
                $q->where('status', 'failed')
                  ->orWhereHas('payment', fn($p) => $p->whereIn('status', ['failed', 'expired', 'cancelled']))
            );
        }

        $payments = $query->paginate(5)->withQueryString();
        $stats = $this->getProfileStats($userId);

        return Inertia::render('Profile/PaymentHistory', [
            'payments'     => $payments,
            'statusFilter' => $status,
            'stats'        => $stats,
        ]);
    }

    public function savedRecipes()
    {
        $userId = $this->currentUserId();

        $savedRecipes = SavedRecipe::where('user_id', $userId)
            ->with('recipe')
            ->get();

        $stats = $this->getProfileStats($userId);

        return Inertia::render('Profile/SavedRecipes', [
            'savedRecipes' => $savedRecipes,
            'stats'        => $stats,
        ]);
    }

    private function getProfileStats($userId): array
    {
        $orderCount = Order::where('user_id', $userId)->count();
        $savedCount = SavedRecipe::where('user_id', $userId)->count();
        $reviewCount = Review::where('user_id', $userId)->count();

        return compact('orderCount', 'savedCount', 'reviewCount');
    }

    private function currentUserId(): ?string
    {
        $user = session('supabase_user');
        return is_array($user) ? ($user['id'] ?? null) : ($user?->id);
    }
}
