<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class SupabaseService
{
    private string $url;
    private string $anonKey;
    private string $serviceRole;

    public function __construct()
    {
        $this->url         = config('supabase.url');
        $this->anonKey     = config('supabase.anon_key');
        $this->serviceRole = config('supabase.service_role');
    }

    public function signIn(string $email, string $password): array
    {
        $response = Http::withHeaders([
            'apikey'        => $this->anonKey,
            'Content-Type'  => 'application/json',
        ])->post("{$this->url}/auth/v1/token?grant_type=password", [
            'email'    => $email,
            'password' => $password,
        ]);

        return $response->json();
    }

    public function signUp(string $email, string $password, array $data = []): array
    {
        $response = Http::withHeaders([
            'apikey'        => $this->anonKey,
            'Content-Type'  => 'application/json',
        ])->post("{$this->url}/auth/v1/signup", [
            'email'    => $email,
            'password' => $password,
            'data'     => $data,
        ]);

        return $response->json();
    }

    public function getUser(string $accessToken): array
    {
        $response = Http::withHeaders([
            'apikey'        => $this->anonKey,
            'Authorization' => "Bearer {$accessToken}",
        ])->get("{$this->url}/auth/v1/user");

        return $response->json();
    }

    public function signOut(string $accessToken): void
    {
        Http::withHeaders([
            'apikey'        => $this->anonKey,
            'Authorization' => "Bearer {$accessToken}",
        ])->post("{$this->url}/auth/v1/logout");
    }
}
