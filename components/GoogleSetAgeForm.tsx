"use client"
import { Box, TextField, Typography, Button, FormControlLabel, Checkbox, Link, FormHelperText } from '@mui/material'
import { useState } from 'react'
export default function GoogleLoginSetAgeForm({ state, action, pending }: GoogleLoginSetAgeFormProps) {
    const [acceptTerms, setAcceptTerms] = useState(false);

    return (
        // 💡 親から受け取った action をそのままフォームに指定します
        <Box component="form" action={action} sx={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left' }}>

            <Typography variant="h5" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#0B132B' }}>
                Complete Profile
            </Typography>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray', mb: 1 }}>
                Google認証に成功しました。登録を完了するために年齢を入力してください。
            </Typography>

            {/* 💡 【超重要】バックエンドから届いている id_token を隠しフィールドで自動送信する */}
            {state.id_token && (
                <input type="hidden" name="id_token" value={state.id_token} />
            )}

            {/* 年齢入力欄 (FormDataで送るために name="age" が必須です) */}
            <TextField
                label="Age *"
                type="number"
                name="age" // 👈 これで Server Action 側に年齢データが届きます
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
            />

            {/* 利用規約同意チェックボックス */}
            <FormControlLabel
                control={
                    <Checkbox
                        required
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        sx={{ '&.Mui-checked': { color: '#4D3CFF' } }}
                    />
                }
                label={
                    <Typography variant="caption" sx={{ fontWeight: 'semibold', color: '#555' }}>
                        I accept all <span style={{ color: '#4D3CFF', textDecoration: 'underline', cursor: 'pointer' }}>Terms & Conditions *</span>
                    </Typography>
                }
            />

            {/* 登録完了ボタン */}
            <Button
                type="submit"
                disabled={pending || !acceptTerms}
                variant="contained"
                fullWidth
                sx={{
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#4D3CFF',
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#3b2ecc' },
                    textTransform: 'none'
                }}
            >
                {pending ? 'Completing...' : 'Complete Sign Up'}
            </Button>
        </Box>
    );
}
interface GoogleLoginSetAgeFormProps {
    state: {
        success: boolean;
        registration_step: string;
        message: string;
        id_token?: string | null; // 💡 バックエンドから返ってきたトークンを保持している前提
    };
    action: (payload: FormData) => void;
    pending: boolean;
}