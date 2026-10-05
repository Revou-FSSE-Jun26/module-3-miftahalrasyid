import SignupForm from '@/components/signup-form'; // Adjust path based on your folder structure
import { JSX } from 'react';
import Link from 'next/link'

export const metadata = {
    title: 'Sign Up - Create Account',
};
const Heading = (): JSX.Element => (
    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
        Create an Account
    </h2>
)

const SubHeading = (): JSX.Element => (
    <p className="mt-2 text-center text-sm text-gray-600">
        Already have an account?{' '}
        {/* 2. 大文字の Link を使い、hrefの指定を修正（スラッシュから始めるのが安全です） */}
        <Link href="/auth/login" className="font-bold text-black-600 underline hover:no-underline">
            Sign in
        </Link>
    </p>
)
export default function RegisterPage() {
    const isEmailVerify = true;
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Calling your Client Component Form here */}
                < SignupForm >
                    <div className='pb-6'>
                        <Heading />
                        <SubHeading />
                    </div>
                </SignupForm>
            </div>
        </div >
    );
}