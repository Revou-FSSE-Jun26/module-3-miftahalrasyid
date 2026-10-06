import LoginForm from '@/components/login-form';
import { JSX } from 'react';
import Link from 'next/link'

export const metadata = {
    title: 'Sign In - Welcome Back',
};


export default async function LoginPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const redirectTo = resolvedParams.next || "/"; // Fallback to main dashboard

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <LoginForm redirectTo={redirectTo}>
                    <div className='pb-6'>
                        <Heading />
                        <SubHeading />
                    </div>
                </LoginForm>
            </div>
        </div>
    );
}

interface PageProps {
    searchParams: Promise<{ next?: string }>;
}

const Heading = (): JSX.Element => (
    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
        Welcome Back
    </h2>
)

const SubHeading = (): JSX.Element => (
    <p className="mt-2 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-bold text-black-600 underline hover:no-underline">
            Sign up
        </Link>
    </p>
)