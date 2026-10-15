'use client'

import { signup, googleSignupAction } from '@/app/actions/auth.actions'
import { Box, TextField, Typography, CircularProgress, Button, Paper, FormControlLabel, Checkbox, Link, FormHelperText } from '@mui/material'
import { useActionState, ReactNode, useState, useRef } from 'react'
import SendEmail from '@/components/send-email'
import { FormState } from '@/app/schemas/auth.schemas'
import GoogleLoginSetAgeForm from '@/components/GoogleSetAgeForm'
import { GoogleLogin } from '@react-oauth/google'

interface SignupFormProps {
    children?: ReactNode;
}

export const initialState: FormState = {
    success: false,
    message: "",
    errors: {},
};
export default function SignupForm({ children }: SignupFormProps) {
    const [normalState, normalAction, normalPending] = useActionState(signup, initialState)
    const [googleState, googleAction, googlePending] = useActionState(
        googleSignupAction,
        { success: false, registration_step: 'FORM', message: '', id_token: null }
    );
    // access_token
    // : 
    // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc4OTYzNjAyMywianRpIjoiMTkzOWNjMDEtMzQ0MC00OTQ3LWI0MTItZmM5MTRlZjY0Y2UwIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMzIiwibmJmIjoxNzg5NjM2MDIzLCJjc3JmIjoiYmI4ZDc0MTMtNmNmZi00OWIxLTkxNjMtMDZhZWVjNDZjMmIzIiwiZXhwIjoxNzg5NjM5NjIzLCJlbWFpbCI6Im1pZnRhaGFscmFzeWlkQGxpdmUuY29tIiwidXNlcm5hbWUiOiJtaWZ0YWhhbHJhc3lpZCIsInJvbGVzIjpbIkJVWUVSIl0sInByb3ZpZGVyIjoiUEFTU1dPUkRfSEFTSCIsImlzX2FjdGl2ZSI6ZmFsc2V9.CwrDkHDk9petZTw42Bcof3l76QAucRMIgj1ucugm5FI"
    // email
    // : 
    // "miftahalrasyid@live.com"
    // is_active
    // : 
    // false
    // message
    // : 
    // "Registration successful. Please verify your email."
    // user_id
    // : 
    // 33
    // username
    // : 
    // "miftahalrasyid"
    // {
    //     isEmailVerify && (
    //         <SendEmail></SendEmail>
    //     )
    // }
    // Reusable style untuk textfield tinggi 40px
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
                {normalState.success ? (
                    <SendEmail></SendEmail>
                ) : isFormStep ? (
                    <>
                        {children}
                        {/* <GoogleLoginButton onAuthSuccess={handleGoogleSuccess} isPending={googlePending} /> */}

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
                        <NormalSignUpForm
                            state={normalState}
                            action={normalAction}
                            pending={normalPending} />
                    </>
                ) : <GoogleLoginSetAgeForm
                    state={googleState}
                    action={googleAction}
                    pending={googlePending}
                />

                }

            </Paper>
        </Box>
    )

}
interface NormalSignUpFormProps {
    state: FormState;
    action: (payload: FormData) => void;
    pending: boolean;
}

function NormalSignUpForm({ state, action, pending }: NormalSignUpFormProps) {
    // const state = {
    //     errors: {
    //         email: "",
    //         password: [],
    //         confirm_password: [],
    //         terms: "",
    //         age: "",
    //     },
    //     success: {
    //     },
    //     message: ""
    // }
    // const pending = false;
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
    const errorListBoxStyle = {
        marginTop: '8px',
        backgroundColor: '#fff1f2', // rose-50
        border: '1px solid #ffe4e6', // rose-100
        borderRadius: '8px',
        padding: '12px',
    };
    // const action = (payload: FormData) => { }
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

                    // 🟩 Sekarang cukup panggil objek style yang sudah disatukan di atas
                    sx={textFieldStyle}
                />
            </Box>

            {/* 🆕 Age Input Group */}
            <Box sx={{ width: '100%' }}>
                <TextField
                    id="age"
                    name="age"
                    type="number"
                    label="Age"
                    placeholder="18"
                    variant="outlined"
                    fullWidth
                    size="small"

                    // Membatasi nilai minimum angka (min="0")
                    slotProps={{
                        htmlInput: { min: 0 }
                    }}

                    // Integrasi Validasi Error dari Server Action
                    error={Boolean(state?.errors?.age)}
                    helperText={state?.errors?.age}

                    // Style ringkas h-10 (40px) agar seragam dengan input email
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            height: '40px',

                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                                borderWidth: '2px',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            transform: 'translate(14px, 9px) scale(1)',
                        },
                        '& .MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#6366f1',
                        },
                        '& .MuiFormHelperText-root': {
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            marginLeft: 0,
                            marginTop: '4px',
                        }
                    }}
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
                    sx={textFieldStyle}
                />
                {state?.errors?.password && (
                    <Box sx={errorListBoxStyle}>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#b91c1c' }}>
                            Password must:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: '#dc2626' }}>
                            {state.errors.password.map((error) => (
                                <li key={error} style={{ marginBottom: '2px' }}>{error}</li>
                            ))}
                        </ul>
                    </Box>
                )}
            </Box>

            {/* Confirm Password Input Group */}
            <Box sx={{ width: '100%', mb: 2 }}>
                <TextField
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    label="Confirm Password"
                    placeholder="••••••••"
                    variant="outlined"
                    fullWidth
                    required
                    size="small"
                    error={Boolean(state?.errors?.password)} // Mengikuti logika state Anda sebelumnya
                    sx={textFieldStyle}
                />
                {state?.errors?.confirm_password && (
                    <Box sx={errorListBoxStyle}>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: '#b91c1c' }}>
                            Password must:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: '#dc2626' }}>
                            {state.errors.confirm_password.map((error) => (
                                <li key={error} style={{ marginBottom: '2px' }}>{error}</li>
                            ))}
                        </ul>
                    </Box>
                )}
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
                        color: state.success ? '#059669' : '#dc2626' // Hijau jika sukses, merah jika error
                    }}
                >
                    {state.message}
                </Typography>
            )}
            <Box sx={{ width: '100%', mb: 2, display: 'flex', flexDirection: 'column' }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            id="terms"
                            name="terms"
                            key={state?.success ? state?.message : JSON.stringify(state?.errors || {})}
                            required // Membuat HTML validation bawaan aktif jika belum dicentang
                            size="small"
                            sx={{
                                color: '#cbd5e1', // slate-300
                                '&.Mui-checked': {
                                    color: '#4f46e5', // indigo-600 saat aktif
                                },
                            }}
                        />
                    }
                    label={
                        <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>
                            I accept all {' '}
                            <Link href="/terms" underline="hover" sx={{ color: '#4f46e5', fontWeight: 600 }}>
                                Terms & Conditions
                            </Link>
                        </span>
                    }
                />

                {/* Menampilkan error jika validasi dikirim dari server action state */}
                {state?.errors?.terms && (
                    <FormHelperText error sx={{ fontSize: '0.75rem', fontWeight: 500, mt: 0.5, ml: 1 }}>
                        {state.errors.terms}
                    </FormHelperText>
                )}
            </Box>
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
                    backgroundColor: '#4f46e5', // indigo-600
                    textTransform: 'none', // Mematikan fitur uppercase otomatis MUI
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': {
                        backgroundColor: '#4338ca', // indigo-700
                    },
                    '&:disabled': {
                        backgroundColor: '#cbd5e1', // slate-300
                        color: '#64748b', // slate-500
                    }
                }}
            >
                {pending ? 'Creating Account...' : 'Sign Up'}
            </Button>

        </form>
    )
}
