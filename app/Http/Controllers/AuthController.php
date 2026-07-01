<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\SupabaseService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function __construct(private SupabaseService $supabase) {}

    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $response = $this->supabase->signIn($request->email, $request->password);

        if (isset($response['error']) || !isset($response['access_token'])) {
            $message = $response['error_description'] ?? $response['message'] ?? 'Email atau password salah.';
            return back()->withErrors(['email' => $message]);
        }

        $accessToken = $response['access_token'];
        $authUser    = $response['user'];

        // Ambil profil lengkap dari tabel public.users
        $user = User::find($authUser['id']);

        session([
            'supabase_access_token' => $accessToken,
            'supabase_user'         => $user ?? $authUser,
        ]);

        return redirect()->intended('/');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email'     => 'required|email',
            'password'  => 'required|string|min:8|confirmed',
        ]);

        $response = $this->supabase->signUp(
            $request->email,
            $request->password,
            ['full_name' => $request->full_name]
        );

        if (isset($response['error']) || !isset($response['user'])) {
            $message = $response['error_description'] ?? $response['message'] ?? 'Pendaftaran gagal.';
            return back()->withErrors(['email' => $message]);
        }

        $authUser = $response['user'];

        // Simpan profil user ke public.users
        $user = User::firstOrCreate(
            ['id' => $authUser['id']],
            [
                'full_name' => $request->full_name,
                'email'     => $request->email,
                'role'      => 'user',
            ]
        );

        // Langsung login jika Supabase mengembalikan access_token
        if (isset($response['session']['access_token'])) {
            session([
                'supabase_access_token' => $response['session']['access_token'],
                'supabase_user'         => $user,
            ]);
            return redirect('/');
        }

        return redirect()->route('login')
            ->with('flash', ['success' => 'Akun berhasil dibuat! Silakan login.']);
    }

    public function logout(Request $request)
    {
        $token = session('supabase_access_token');

        if ($token) {
            $this->supabase->signOut($token);
        }

        $request->session()->forget(['supabase_access_token', 'supabase_user']);
        $request->session()->regenerate();

        return redirect()->route('login');
    }
}
