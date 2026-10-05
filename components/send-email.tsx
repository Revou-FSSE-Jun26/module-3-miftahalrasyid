'use client'
import React from 'react';
import { Box, Button, Typography, Paper, Stack, Link } from '@mui/material';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';

export default function SendEmail() {
    const handleOpenEmailClient = () => {
        const userEmail = "rasyidmiftah67@gmail.com";

        // 2. Define your system's sending email or a specific subject line to search for
        // const senderEmail = "noreply@yourdomain.com";

        // 3. Create a deep link that forces the correct inbox AND pre-searches for your email
        const gmailShortcut = `https://mail.google.com/mail/u/?authuser=${userEmail}`;
        // const gmailShortcut = `https://mail.google.com/mail/u/?authuser=${userEmail}/#search/from:${senderEmail}`;

        // 4. Open it safely in a new tab
        window.open(gmailShortcut, '_blank', 'noopener,noreferrer');
    };

    const handleResendEmail = () => {
        console.log('Pemicu kirim ulang tautan verifikasi ke backend');
        // Integrasikan API kirim ulang email verifikasi Anda di sini
    };
    return (


        <Stack spacing={3} component="div" sx={{
            display: 'flex',
            alignItems: 'center',
        }}>
            {/* Animated/Decorative Send Email Icon */}
            <Box
                sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)'
                }}
            >
                <ForwardToInboxIcon sx={{ fontSize: 40 }} />
            </Box>

            {/* Main Title */}
            <Typography
                component="h1"
                variant="h4"
                color="text.primary"
                sx={{ fontWeight: 'bold' }}
            >
                Registration Successful!
            </Typography>

            {/* Description Text (Left-aligned) */}
            <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                    px: 2,
                    lineHeight: 1.6,
                    textAlign: 'left',
                    width: '100%'
                }}
            >
                We have sent a <b>verification link</b> to your email address.
                Please click the link inside to activate your account.
            </Typography>

            {/* Quick Access Main Button */}
            <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleOpenEmailClient}
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
                Open Email Inbox
            </Button>

            {/* Help / Resend Text */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Didn&apos;t receive the email? Check your Spam folder or{' '}
                <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleResendEmail}
                    sx={{ fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
                >
                    Resend link
                </Link>
            </Typography>
        </Stack>

    )
}