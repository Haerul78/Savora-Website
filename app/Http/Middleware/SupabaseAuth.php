<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SupabaseAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = session('supabase_access_token');
        $user  = session('supabase_user');

        if (!$token || !$user) {
            return redirect()->route('login')
                ->with('flash', ['error' => 'Silakan login terlebih dahulu.']);
        }

        return $next($request);
    }
}
