"use client";

import { logger } from '@/utils/logger';
import { useGoogleLogin, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
    // const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [age, setAge] = useState<number>(18); // Default nilai umur sesuai contoh schema Swagger Anda
    // const onSuccessLogin = (credentialResponse: CredentialResponse) => {
    //     if (credentialResponse.credential) {
    // credentialResponse.credential berisi 'id_token' murni dari Google
    // handleVerifyWithFlask(credentialResponse.credential);
    //         logger.info({ data: credentialResponse }, "Google OauthLogin Successful!")
    //     }
    // }
    const loginWithCustomGoogle = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // 1. Tukarkan access_token dengan payload profil pengguna langsung ke Google
                const googleProfileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profileData = await googleProfileRes.json();
                logger.info({ data: profileData }, "Google OauthLogin Successful!")
                // 2. Kirim access_token beserta data email hasil fetch ke Flask Anda
                // const res = await fetch('/api-images/api/v1/auth/oauth/google', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({
                //         id_token: tokenResponse.access_token, // Kirim access token
                //         email: profileData.email, // Menyisipkan email agar Flask bisa langsung membaca user
                //         age: 18 // Fallback default umur
                //     }),
                // });

                // const data = await res.json();
                // if (res.ok && data.access_token) {
                //     localStorage.setItem('access_token', data.access_token);
                //     router.push('/dashboard');
                // } else {
                //     alert(`Gagal: ${data.message}`);
                // }
            } catch (error) {
                console.error("Proses verifikasi kustom gagal:", error);
            } finally {
                setLoading(false);
            }
        },
        onError: () => console.log('Login Gagal'),
    });

    return (
        /* 🚀 BUTTON HTML MURNI: Dijamin 100% responsif mengikuti w-full kontainer */
        <button
            onClick={() => loginWithCustomGoogle()}
            disabled={loading}
            className="w-full flex items-center pl-4 pr-4 border border-[#DADCE0] rounded bg-white text-[#3C4043] hover:bg-[#F8F9FA] active:bg-[#F1F3F4] transition font-sans font-medium text-sm shadow-sm disabled:opacity-50"
            style={{ height: '40px' }}
        >
            {/* 🌐 LOGO GOOGLE: Ukuran tetap terjaga 18px, tidak akan mengkerut karena tidak memakai margin */}
            <svg
                className="w-[18px] h-[18px] flex-shrink-0"
                viewBox="0 0 24 24"
                version="1.1"
                xmlns="http://w3.org"
            >
                <path
                    fill="#4285F4"
                    d="M23.745,12.273 C23.745,11.482 23.673,10.718 23.545,9.982 L12,9.982 L12,14.327 L18.577,14.327 C18.295,15.836 17.445,17.114 16.168,17.968 L16.168,20.786 L19.986,20.786 C22.227,18.723 23.745,15.682 23.745,12.273 Z"
                />
                <path
                    fill="#34A853"
                    d="M12,24 C15.241,24 17.964,22.927 19.986,20.786 L16.168,17.968 C15.109,18.677 13.673,19.1 12,19.1 C8.868,19.1 6.218,16.986 5.268,14.141 L1.314,14.141 L1.314,17.205 C3.295,21.136 7.332,24 12,24 Z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.268,14.141 C5.018,13.4 4.877,12.609 4.877,11.791 C4.877,10.973 5.018,10.182 5.268,9.436 L5.268,6.373 L1.314,6.373 C0.473,8.05 0,9.923 0,11.791 C0,13.659 0.473,15.532 1.314,17.209 L5.268,14.141 Z"
                />
                <path
                    fill="#EA4335"
                    d="M12,4.9 C13.764,4.9 15.345,5.509 16.591,6.7 L19.745,3.545 C17.959,1.877 15.236,0 12,0 C7.332,0 3.295,2.864 1.314,6.373 L5.268,9.436 C6.218,6.591 8.868,4.9 12,4.9 Z"
                />
            </svg>

            {/* 📝 TEKS TOMBOL */}
            <span className="flex-grow text-center tracking-wide">
                {loading ? 'Memproses...' : 'Sign in with Google'}
            </span>
        </button>
    );
}