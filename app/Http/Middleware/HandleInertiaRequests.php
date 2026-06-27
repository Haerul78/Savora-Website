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
        $user = session('user');

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'         => $user['id'],
                    'name'       => $user['user_metadata']['full_name'] ?? '',
                    'email'      => $user['email'],
                    'avatar_url' => $user['user_metadata']['avatar_url'] ?? null,
                ] : null,
            ],
            'cartCount' => $user
                ? \App\Models\CartItem::where('user_id', $user['id'])->sum('quantity')
                : 0,
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }
}
