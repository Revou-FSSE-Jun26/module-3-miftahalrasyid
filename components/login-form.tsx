'use client'

import { login } from '@/app/actions/auth.actions'
import { LoginFormState } from '@/app/schemas/auth.schemas';
import { Box, TextField, Typography, CircularProgress, Button, Paper } from '@mui/material'
import { useRouter } from 'next/navigation';
import { useActionState, ReactNode, useEffect } from 'react'

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
    const [state, action, pending] = useActionState(loginWithRedirect, loginInitialState)

    const router = useRouter();
    useEffect(() => {
        if (state.success) {
            router.push(redirectTo);
            router.refresh();
        }
    }, [state.success, redirectTo, router]);
    // Reusable style untuk textfield tinggi 40px (sama dengan signup-form)
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
        '&:has(input:-webkit-autofill) .MuiInputLabel-root, & .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75) !important',
        },
    };

    return (
        <Box className="flex justify-center items-center min-h-[80vh] px-4">
            <Paper elevation={3} sx={{ p: 5, borderRadius: 3, width: '100%', textAlign: 'center' }}>
                {children}
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
            </Paper>
        </Box>
    )
}
