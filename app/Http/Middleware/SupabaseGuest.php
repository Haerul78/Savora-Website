<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SupabaseGuest
{
    public function handle(Request $request, Closure $next): Response
    {
        if (session('supabase_access_token') && session('supabase_user')) {
            return redirect()->route('home');
        }

        return $next($request);
    }
}
