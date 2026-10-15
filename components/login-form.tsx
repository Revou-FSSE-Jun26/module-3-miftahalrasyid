'use client'

import { login, googleSignupAction } from '@/app/actions/auth.actions'
import { LoginFormState } from '@/app/schemas/auth.schemas';
import { Box, TextField, Typography, CircularProgress, Button, Paper } from '@mui/material'
import { useRouter } from 'next/navigation';
import { useActionState, ReactNode, useEffect, useRef } from 'react'
import { FormState } from '@/app/schemas/auth.schemas'
import { GoogleLogin } from '@react-oauth/google'
import GoogleLoginSetAgeForm from '@/components/GoogleSetAgeForm'

interface LoginFormProps {
    children?: ReactNode;
    redirectTo: string
}

export const loginInitialState: LoginFormState = {
    success: false,
    message: "",
    errors: {},
};

export default function LoginForm({ redirectTo, children }: LoginFormProps) {
    const loginWithRedirect = login.bind(null, redirectTo);
    const [normalState, normalAction, normalPending] = useActionState(loginWithRedirect, loginInitialState)
    const [googleState, googleAction, googlePending] = useActionState(
        googleSignupAction,
        { success: false, registration_step: 'FORM', message: '', id_token: null }
    );
    const router = useRouter();
    useEffect(() => {
        if (normalState.success) {
            router.push(redirectTo);
            router.refresh();
        }
    }, [normalState.success, redirectTo, router]);
    // Reusable style untuk textfield tinggi 40px (sama dengan signup-form)
    const hiddenGoogleFormRef = useRef<HTMLFormElement>(null);

    // 💡 Googleボタンが成功した時に動く中継関数
    const handleGoogleSuccess = (accessToken: string) => {
        if (!hiddenGoogleFormRef.current) return;

        // 非表示フォームの中の隠しインプットに、Googleから届いたトークンをセット
        const tokenInput = hiddenGoogleFormRef.current.querySelector('input[name="id_token"]') as HTMLInputElement;
        if (tokenInput) {
            tokenInput.value = accessToken;
            // フォームを自動送信（これにより (prevState, formData) の形でActionが走る！）
            hiddenGoogleFormRef.current.requestSubmit();
        }
    };

    const isFormStep = googleState.registration_step === 'FORM';

    return (
        <Box className="flex justify-center items-center min-h-[80vh] px-4">
            <Paper elevation={3} sx={{ p: 5, borderRadius: 3, width: '100%', textAlign: 'center' }}>
                {isFormStep ? (
                    <>
                        {children}
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                // 💡 100% 本物の id_token が手に入ります！
                                if (credentialResponse.credential) {
                                    handleGoogleSuccess(credentialResponse.credential);
                                }
                            }}
                            onError={() => console.log('Login Failed')}
                            width={336}
                            useOneTap={false}
                        />
                        <form ref={hiddenGoogleFormRef} action={googleAction} style={{ display: 'none' }}>
                            <input type="hidden" name="id_token" />
                            <input type="hidden" name="age" value="" /> {/* 1回目は空で送る */}
                        </form>
                        <div className="relative flex items-center py-5 my-1">
                            <div className="grow border-t border-gray-300"></div>

                            <span className="shrink mx-4 text-sm font-medium text-gray-400 bg-white px-2">
                                OR
                            </span>

                            <div className="grow border-t border-gray-300"></div>
                        </div>
                        <NormalSignInForm state={normalState}
                            action={normalAction}
                            pending={normalPending} />
                    </>) : <GoogleLoginSetAgeForm
                    state={googleState}
                    action={googleAction}
                    pending={googlePending}
                />}
            </Paper>
        </Box>
    )
}

interface NormalSignInFormProps {
    state: FormState;
    action: (payload: FormData) => void;
    pending: boolean;
}

function NormalSignInForm({ state, action, pending }: NormalSignInFormProps) {
    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            height: '40px',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: '2px' },

            '&:has(input:-webkit-autofill) .MuiOutlinedInput-notchedOutline legend': {
                maxWidth: '100% !important',
            },

            '& input:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 100px #ffffff inset !important',
                WebkitTextFillColor: '#0f172a !important',
            },
        },
        '& .MuiInputLabel-root': {
            transform: 'translate(14px, 9px) scale(1)',
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#6366f1',
        },
        '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            fontWeight: 500,
            marginLeft: 0,
            marginTop: '4px',
        },

        // 🟩 2. LOGIKA UTAMA: Memaksa label naik ke atas (shrink) JIKA komponen mendeteksi adanya teks autofill browser
        '&:has(input:-webkit-autofill) .MuiInputLabel-root, & .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75) !important',
        },
    };
    return (
        <form action={action} className="space-y-5">

            {/* Email Input Group */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, width: '100%' }}>
                <TextField
                    id="email"
                    name="email"
                    type="email"
                    size='small'
                    label="Email Address"
                    placeholder="you@example.com"
                    variant="outlined"
                    fullWidth
                    error={Boolean(state?.errors?.email)}
                    helperText={state?.errors?.email}
                    sx={textFieldStyle}
                />
            </Box>

            {/* Password Input Group */}
            <Box sx={{ width: '100%', mb: 2 }}>
                <TextField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    variant="outlined"
                    fullWidth
                    required
                    size="small"
                    error={Boolean(state?.errors?.password)}
                    helperText={state?.errors?.password}
                    sx={textFieldStyle}
                />
            </Box>

            {/* Global Error/Success Message */}
            {state?.message && (
                <Typography
                    variant="body2"
                    align="center"
                    sx={{
                        fontWeight: 500,
                        mt: 1,
                        mb: 2,
                        color: state.success ? '#059669' : '#dc2626'
                    }}
                >
                    {state.message}
                </Typography>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={pending}
                startIcon={pending ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#4f46e5',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': {
                        backgroundColor: '#4338ca',
                    },
                    '&:disabled': {
                        backgroundColor: '#cbd5e1',
                        color: '#64748b',
                    }
                }}
            >
                {pending ? 'Signing In...' : 'Sign In'}
            </Button>

        </form>
    )
}