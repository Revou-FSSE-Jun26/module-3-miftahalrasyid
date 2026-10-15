"use client";

import { logger } from '@/utils/logger';
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

interface GoogleLoginButtonProps {
    onAuthSuccess: (accessToken: string) => void;
    isPending: boolean;
}

export default function GoogleLoginButton({ onAuthSuccess, isPending }: GoogleLoginButtonProps) {
    const [loading, setLoading] = useState(false);

    const loginWithCustomGoogle = useGoogleLogin({
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // 💡 Googleから取得した access_token をそのまま親の関数に引き渡します！
                if (tokenResponse.access_token) {
                    onAuthSuccess(tokenResponse.access_token);
                }
            } catch (error) {
                logger.error("Verification process failed:" + error);
            } finally {
                setLoading(false);
            }
        },
        onError: () => logger.error('Login failed'),
    });

    // ボタン全体の無効化状態（Google通信中、または親のServer Action通信中）
    const disabledState = loading || isPending;

    return (
        <button
            onClick={() => loginWithCustomGoogle()}
            type="button" // 💡 フォームの誤作動を防ぐために button タイプを明示
            disabled={disabledState}
            className="w-full flex items-center pl-4 pr-4 border border-[#DADCE0] rounded bg-white text-[#3C4043] hover:bg-[#F8F9FA] active:bg-[#F1F3F4] transition font-sans font-medium text-sm shadow-sm disabled:opacity-50"
            style={{ height: '40px' }}
        >
            <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745,12.273 C23.745,11.482 23.673,10.718 23.545,9.982 L12,9.982 L12,14.327 L18.577,14.327 C18.295,15.836 17.445,17.114 16.168,17.968 L16.168,20.786 L19.986,20.786 C22.227,18.723 23.745,15.682 23.745,12.273 Z" />
                <path fill="#34A853" d="M12,24 C15.241,24 17.964,22.927 19.986,20.786 L16.168,17.968 C15.109,18.677 13.673,19.1 12,19.1 C8.868,19.1 6.218,16.986 5.268,14.141 L1.314,14.141 L1.314,17.205 C3.295,21.136 7.332,24 12,24 Z" />
                <path fill="#FBBC05" d="M5.268,14.141 C5.018,13.4 4.877,12.609 4.877,11.791 C4.877,10.973 5.018,10.182 5.268,9.436 L5.268,6.373 L1.314,6.373 C0.473,8.05 0,9.923 0,11.791 C0,13.659 0.473,15.532 1.314,17.209 L5.268,14.141 Z" />
                <path fill="#EA4335" d="M12,4.9 C13.764,4.9 15.345,5.509 16.591,6.7 L19.745,3.545 C17.959,1.877 15.236,0 12,0 C7.332,0 3.295,2.864 1.314,6.373 L5.268,9.436 C6.218,6.591 8.868,4.9 12,4.9 Z" />
            </svg>
            <span className="flex-grow text-center tracking-wide">
                {disabledState ? 'Memproses...' : 'Sign in with Google'}
            </span>
        </button>
    );
}