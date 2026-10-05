import * as z from 'zod'

export const SignupFormSchema = z.object({
    email: z.email({ error: 'Please enter a valid email.' }).trim(),
    password: z
        .string()
        .min(6, { error: 'Be at least 8 characters long' })
        // .regex(/[a-zA-Z]/, { error: 'Contain at least one letter.' })
        // .regex(/[0-9]/, { error: 'Contain at least one number.' })
        // .regex(/[^a-zA-Z0-9]/, {
        //     error: 'Contain at least one special character.',
        // })
        .trim(),
    confirm_password: z
        .string()
        .min(6, { error: 'Be at least 8 characters long' })
        .trim(),
    age: z
        .coerce // Automatically converts input string "18" into a number 18
        .number({ message: 'Age must be a number.' })
        .gte(18, { message: 'You must be at least 18 years old to sign up.' }),
    terms: z
        .string()
        .min(1, { message: 'You must accept the terms and conditions.' }),
})
    .refine((data) => data.password === data.confirm_password, {
        message: "Passwords don't match",
        path: ['confirm_password'], // Menentukan ke mana error ini akan dikirim (field confirm_password)
    });

export type FormState = {
    success: boolean;
    message?: string;
    errors?: {
        email?: string[];
        password?: string[];
        confirm_password?: string[];
        age?: string[];
        terms?: string[];
    };
};
export const LoginFormSchema = z.object({
    email: z.email({ error: 'Please enter a valid email.' }).trim(),
    password: z
        .string()
        .min(1, { error: 'Password is required.' })
        .trim(),
});

export type LoginFormState = {
    success: boolean;
    message?: string;
    errors?: {
        email?: string[];
        password?: string[];
    };
};
