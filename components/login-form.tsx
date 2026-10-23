'use client'

import { login, googleSignupAction } from '@/app/actions/auth.actions'
import { LoginFormState } from '@/app/schemas/auth.schemas';
import { Box, Typography, CircularProgress, Button, Paper, FormControl, FormHelperText, InputLabel, InputAdornment, IconButton, FilledInput } from '@mui/material'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import { useRouter } from 'next/navigation';
import { useActionState, ReactNode, useEffect, useRef, useState, useId } from 'react'
import { FormState } from '@/app/schemas/auth.schemas'
import { GoogleLogin } from '@react-oauth/google'
import GoogleLoginSetAgeForm from '@/components/GoogleSetAgeForm'
import { logger } from '@/utils/logger';

interface LoginFormProps {
    children?: ReactNode;
    redirectTo: string;
    isAuthenticated: true | undefined
}

export const loginInitialState: LoginFormState = {
    success: false,
    message: "",
    errors: {},
};

export default function LoginForm({ redirectTo, children, isAuthenticated }: LoginFormProps) {
    const loginWithRedirect = login.bind(null, redirectTo);
    const [normalState, normalAction, normalPending] = useActionState(loginWithRedirect, loginInitialState)
    const [isGoogleLoading, setIsGoogleLoading] = useState(true);
    const [googleState, googleAction, googlePending] = useActionState(
        googleSignupAction,
        { success: false, registration_step: 'FORM', message: '', id_token: null }
    );
    const router = useRouter();
    useEffect(() => {
        if (normalState.success) {
            localStorage.removeItem('email');
            localStorage.removeItem('password');
            router.push(redirectTo);
            router.refresh();
        }
        // ✅ Keep normalState.message here so the hook catches the completed state change!
    }, [normalState.message, normalState.success, redirectTo, router]);

    useEffect(() => {
        // 🛡️ The Guard: Only kick the user out to "/" if they are already logged in 
        // AND they didn't just successfully hit the login button right now.
        if (isAuthenticated && !normalState.success) {
            router.push("/");
        }
    }, [isAuthenticated, normalState.success]);
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
                        {isGoogleLoading && <GoogleButtonSkeleton />}
                        <div
                            className={`w-full max-w-84 transition-opacity duration-200 ${isGoogleLoading ? "hidden" : "block"
                                }`}
                            /* Triggers the state swap as soon as the DOM element registers */
                            ref={(el) => {
                                if (el && isGoogleLoading) {
                                    setTimeout(() => setIsGoogleLoading(false), 250);
                                }
                            }}
                        >
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
                        </div>

                        <form ref={hiddenGoogleFormRef} action={googleAction} style={{ display: 'none' }}>
                            <input type="hidden" name="id_token" />
                            <input type="hidden" name="age" value="" /> {/* 1回目は空で送る */}
                        </form>

                        {/* TEST-ONLY: Playwright drives Google login through this hidden
                            button instead of Google's iframe/SDK, so tests never contact
                            Google. It reuses the real handleGoogleSuccess path with a dummy
                            id_token; the backend /auth/oauth/google call is mocked.
                            Rendered only when NEXT_PUBLIC_TEST_MODE==="1" (never in prod). */}
                        {process.env.NEXT_PUBLIC_TEST_MODE === "1" && (
                            <button
                                type="button"
                                data-testid="google-signin-test"
                                style={{ display: 'none' }}
                                onClick={() => handleGoogleSuccess("fake.google.id_token.for.tests")}
                            >
                                test google login
                            </button>
                        )}
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
        // '& .MuiOutlinedInput-notchedOutline': {
        //     borderRadius: '12px',
        // },
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
    // restore form data from localStorage when page loaded
    const [emailState, setEmailState] = useState('')
    const standardStartId = useId();
    const [passwordState, setPasswordState] = useState('')
    const outlinedPasswordId = useId();
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    // 2. LOAD the email from localStorage when the component mounts in the browser
    useEffect(() => {
        const savedEmail = localStorage.getItem('email');
        if (savedEmail) {
            setEmailState(savedEmail);
        }
        const savedPassword = localStorage.getItem('password');
        if (savedPassword) {
            setPasswordState(savedPassword);
        }
    }, []);
    // console.log("email state", emailState, state.message, emailRef.current?.value)
    // 3. SAVE the email to localStorage whenever an error appears

    useEffect(() => {
        // Check if a message exists and your state has text
        if (state.message && emailState) {
            // console.log("Saving email to localStorage:", emailState);
            localStorage.setItem('email', emailState);
        }
        if (state.message && passwordState) {
            // console.log("Saving password to localStorage:", emailState);
            localStorage.setItem('password', passwordState);
        }
    }, [state.message]);

    return (
        <form action={action} className="space-y-5">

            {/* Email Input Group */}
            <FormControl error={Boolean(state?.errors?.email)} variant="filled" sx={{ mb: 2, width: '100%' }}>
                <InputLabel htmlFor={`${standardStartId}-input`}>Email Address</InputLabel>
                <FilledInput
                    id={`${standardStartId}-input`}
                    name="email"
                    type="email"
                    value={emailState}
                    onChange={(e) => setEmailState(e.target.value)}
                    placeholder="you@example.com"
                    sx={textFieldStyle}
                />
                <FormHelperText id="email-helper-text">
                    {state?.errors?.email}
                </FormHelperText>
            </FormControl>


            {/* Password Input Group */}
            <FormControl error={Boolean(state?.errors?.password)} sx={{ mb: 2, width: '100%' }} variant="filled">
                <InputLabel htmlFor={`${outlinedPasswordId}-input`}>Password</InputLabel>
                <FilledInput
                    id={`${outlinedPasswordId}-input`}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordState}
                    onChange={(e) => setPasswordState(e.target.value)}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={
                                    showPassword ? 'hide the password' : 'display the password'
                                }
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    sx={textFieldStyle}
                />
                <FormHelperText id="email-helper-text">
                    {state?.errors?.password}
                </FormHelperText>
            </FormControl>

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
function GoogleButtonSkeleton() {
    return (
        <div className="relative top-0 inset-0 flex items-center justify-between w-full max-w-84 mx-auto p-3 border border-gray-200 rounded-xl bg-gray-50 animate-pulse pointer-events-none z-10">
            <div className="flex items-center gap-3">
                {/* Fake Avatar Image */}
                <div className="h-6 w-6 rounded-full bg-gray-200" />
                {/* Fake Identity Text */}
                <div className="space-y-1">
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>
            </div>
            {/* Fake Google Logo Icon */}
            <div className="h-5 w-5 rounded-full bg-gray-200" />
        </div>
    );
}