'use client'

import { signup, googleSignupAction } from '@/app/actions/auth.actions'
import { FormControlLabel, Checkbox, Link, Box, Typography, CircularProgress, Button, Paper, FormControl, FormHelperText, InputLabel, InputAdornment, IconButton, FilledInput } from '@mui/material'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import { useActionState, ReactNode, useState, useRef, useId, useEffect } from 'react'
import SendEmail from '@/components/send-email'
import { FormState } from '@/app/schemas/auth.schemas'
import GoogleLoginSetAgeForm from '@/components/GoogleSetAgeForm'
import { GoogleLogin } from '@react-oauth/google'
import { logger } from '@/utils/logger'
import { useRouter } from 'next/navigation';

interface SignupFormProps {
    children?: ReactNode;
    isAuthenticated: true | undefined
}

export const initialState: FormState = {
    success: false,
    message: "",
    errors: {},
};
export default function SignupForm({ children, isAuthenticated }: SignupFormProps) {
    const [normalState, normalAction, normalPending] = useActionState(signup, initialState)
    const [isGoogleLoading, setIsGoogleLoading] = useState(true);
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
                            pending={normalPending}
                            isAuthenticated={isAuthenticated} />
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
    isAuthenticated: true | undefined;
}

function NormalSignUpForm({ state, action, pending, isAuthenticated }: NormalSignUpFormProps) {
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
    const router = useRouter();
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
    // const errorListBoxStyle = {
    //     marginTop: '8px',
    //     backgroundColor: '#fff1f2', // rose-50
    //     border: '1px solid #ffe4e6', // rose-100
    //     borderRadius: '8px',
    //     padding: '12px',
    // };
    const errorListTextStyle = {
        ml: 1.75,
        color: '#c10007',
    }
    const [formValues, setFormValues] = useState({
        email: '',
        age: '',
        password: '',
        confirmPassword: ''
    });
    // 3. LOAD saved registration data when page loads
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEmail = localStorage.getItem('register_email') || '';
            const savedAge = localStorage.getItem('register_age') || '';
            const savedPassword = localStorage.getItem('register_password') || '';
            setFormValues(prev => ({
                ...prev,
                email: savedEmail,
                age: savedAge,
                password: savedPassword
            }));
        }
    }, []);

    // 4. WIPE storage only when server explicitly returns success
    useEffect(() => {
        if (state?.success) {
            localStorage.removeItem('register_email');
            localStorage.removeItem('register_age');
            localStorage.removeItem('register_password');
            setFormValues({ email: '', age: '', password: '', confirmPassword: '' });
            router.push("/");
        }
    }, [state?.success, router]);
    useEffect(() => {
        if (isAuthenticated && !state?.success) {
            router.push("/");
        }
    }, [isAuthenticated, state?.success, router])
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));

        // Instantly cache non-sensitive fields so they survive validation failures & refreshes
        // if (name === 'email') {
        //     localStorage.setItem('register_email', value);
        // } else if (name === 'age') {
        //     localStorage.setItem('register_age', value);
        // }
        // else if (name === 'password') {
        //     localStorage.setItem('register_password', value);
        // }
    };
    useEffect(() => {
        logger.info({ errors: state?.errors, values: formValues }, "fetch formValues when fail signup")
        if (state?.errors && formValues.email) {
            localStorage.setItem('register_email', formValues.email);
        }
        if (state?.errors && formValues.age) {
            localStorage.setItem('register_age', formValues.age);
        }
        if (state?.errors && formValues.password) {
            localStorage.setItem('register_password', formValues.password);
        }
    }, [state?.errors?.email, state?.errors?.password, state?.errors?.confirm_password, state?.errors?.password, state?.errors?.age])

    const standardStartId = useId();

    const outlinedPasswordId = useId();
    const outlinedConfirmPasswordId = useId();
    const [showPasswords, setShowPasswords] = useState({
        password: false,
        confirmPassword: false,
    });
    const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };


    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    // const action = (payload: FormData) => { }
    return (
        <form action={action} className="space-y-5">

            {/* Email Input Group */}
            <FormControl error={Boolean(state?.errors?.email)} variant="filled" sx={{ mb: 2, width: '100%' }}>
                <InputLabel htmlFor={`${standardStartId}-input`}>Email Address</InputLabel>
                <FilledInput
                    id={`${standardStartId}-input`}
                    name="email"
                    type="email"

                    value={formValues.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    sx={textFieldStyle}
                />
                {state?.errors?.email && (
                    <FormHelperText sx={errorListTextStyle}>{state.errors.email[0]}</FormHelperText>
                )}
            </FormControl>
            {/* 🆕 Age Input Group */}
            <FormControl
                variant="filled"
                error={Boolean(state?.errors?.age)}
                size="small"
                sx={{ mb: 2, width: '100%' }}
            >
                {/* 2. Floating Title Label */}
                <InputLabel htmlFor="age">Age</InputLabel>

                {/* 3. The Structural Filled Text Input Field */}
                <FilledInput
                    id="age"
                    name="age"

                    type="number"
                    placeholder="18"
                    value={formValues.age}
                    onChange={handleInputChange}
                    // Native HTML Attribute Constraints passed down cleanly
                    inputProps={{ min: 0 }}

                    sx={{
                        ...textFieldStyle, // Keeps your core base styles intact

                        // Forces custom low-height constraints like your previous size="small"
                        '& .MuiFilledInput-input': {
                            paddingTop: '20px',    // Room for the floating label above text
                            paddingBottom: '6px',   // Snug padding to achieve your ~40px height target
                            height: 'auto',
                        },

                        // Optional override for custom corner rounding to match the image layout
                        borderRadius: '8px 8px 0 0',
                    }}
                />

                {/* 4. Validation Response String Element below the baseline */}
                {state?.errors?.age && (
                    <FormHelperText id="age-error-text" sx={errorListTextStyle}>
                        {state.errors.age}
                    </FormHelperText>
                )}
            </FormControl>
            {/* Password Input Group */}

            <FormControl error={Boolean(state?.errors?.password)} sx={{ mb: 2, width: '100%' }} variant="filled">
                <InputLabel htmlFor={`${outlinedPasswordId}-input`}>Password</InputLabel>
                <FilledInput
                    id={`${outlinedPasswordId}-input`}
                    name="password"

                    type={showPasswords.password ? 'text' : 'password'}
                    value={formValues.password}
                    onChange={handleInputChange}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={
                                    showPasswords.password ? 'hide the password' : 'display the password'
                                }
                                onClick={() => togglePasswordVisibility('password')}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                            >
                                {showPasswords.password ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    sx={textFieldStyle}
                />
                {state?.errors?.password && (
                    <FormHelperText sx={errorListTextStyle}>{state.errors.password[0]}</FormHelperText>
                )}
            </FormControl>



            {/* Confirm Password Input Group */}

            <FormControl error={Boolean(state?.errors?.password)} sx={{ mb: 2, width: '100%' }} variant="filled">
                <InputLabel htmlFor={`${outlinedConfirmPasswordId}-input`}>Confirm Password</InputLabel>
                <FilledInput
                    id={`${outlinedConfirmPasswordId}-input`}
                    name="confirm_password"

                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                    value={formValues.confirmPassword}
                    onChange={handleInputChange}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={
                                    showPasswords.confirmPassword ? 'hide the password' : 'display the password'
                                }
                                onClick={() => togglePasswordVisibility('confirmPassword')}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                            >
                                {showPasswords.confirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    sx={textFieldStyle}
                />
                {state?.errors?.confirm_password && (
                    <FormHelperText sx={errorListTextStyle}>{state.errors.confirm_password[0]}</FormHelperText>
                )}
            </FormControl>
            {/* <Box sx={{ width: '100%', mb: 2 }}>
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
            </Box> */}

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
                    <FormHelperText error sx={{ ...errorListTextStyle, fontSize: '0.75rem', fontWeight: 500, mt: 0.5, ml: 1 }}>
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