<?php

return [
    'url'          => env('SUPABASE_URL'),
    'anon_key'     => env('SUPABASE_PUBLISHABLE_KEY'),
    'service_role' => env('SUPABASE_SECRET_KEY'),
    'jwks_url'     => env('SUPABASE_JWKS_URL'),
];
