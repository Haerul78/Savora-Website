<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = session('supabase_user');

        // Handle baik Eloquent model maupun raw array dari Supabase auth
        $userId    = is_array($user) ? ($user['id'] ?? null) : ($user?->id);
        $fullName  = is_array($user) ? ($user['full_name'] ?? $user['user_metadata']['full_name'] ?? '') : ($user?->full_name ?? '');
        $email     = is_array($user) ? ($user['email'] ?? '') : ($user?->email ?? '');
        $avatarUrl = is_array($user) ? ($user['avatar_url'] ?? $user['user_metadata']['avatar_url'] ?? null) : ($user?->avatar_url);
        $role      = is_array($user) ? ($user['role'] ?? 'user') : ($user?->role ?? 'user');

        $flash = session('flash', []);

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? compact('userId', 'fullName', 'email', 'avatarUrl', 'role') : null,
            ],
            'cartCount' => $userId
                ? \App\Models\CartItem::where('user_id', $userId)->sum('quantity')
                : 0,
            'flash' => [
                'success' => $flash['success'] ?? session('success'),
                'error'   => $flash['error'] ?? session('error'),
            ],
        ]);
    }
}
