import Link from "next/link";
import { Suspense } from "react";
import { verifyEmailToken } from "@/app/actions/verify-email.actions";

interface PageProps {
    searchParams: Promise<{ token?: string }>;
}

/**
 * Email verification page.
 *
 * The actual token check is an async server call, so it's isolated in
 * <VerifyResult> and wrapped in <Suspense>. That lets the page shell paint
 * instantly with a skeleton while the verification runs, instead of a blank
 * screen until the request resolves.
 */
export default function VerifyEmailPage({ searchParams }: PageProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
            <Suspense fallback={<VerifyingSkeleton />}>
                <VerifyResult searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function VerifyResult({ searchParams }: PageProps) {
    const { token } = await searchParams;

    if (!token) {
        return (
            <ResultCard
                tone="error"
                title="Verification error"
                message="Invalid access. Authentication token could not be found."
                href="/"
                cta="Go back to home"
            />
        );
    }

    const { isSuccess, message } = await verifyEmailToken(token);

    return isSuccess ? (
        <ResultCard
            tone="success"
            title="Confirmation complete"
            message={message}
            href="/auth/login"
            cta="Go to login"
        />
    ) : (
        <ResultCard
            tone="error"
            title="Verification error"
            message={message}
            href="/"
            cta="Go back to home"
        />
    );
}

/** Skeleton shown while the token is being verified. */
function VerifyingSkeleton() {
    return (
        <div className="w-full max-w-md rounded-lg bg-white dark:bg-[#111] p-8 shadow-md border-t-4 border-gray-200 dark:border-gray-800 animate-pulse">
            <div className="mx-auto mb-5 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="mx-auto mb-3 h-6 w-48 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mx-auto mb-6 h-4 w-64 rounded bg-gray-100 dark:bg-gray-900" />
            <div className="h-10 w-full rounded-md bg-gray-200 dark:bg-gray-800" />
            <p className="mt-4 text-center text-sm text-gray-400">
                Verifying your email…
            </p>
        </div>
    );
}

function ResultCard({
    tone,
    title,
    message,
    href,
    cta,
}: {
    tone: "success" | "error";
    title: string;
    message: string;
    href: string;
    cta: string;
}) {
    const borderColor =
        tone === "success" ? "border-green-500" : "border-red-500";
    const messageColor =
        tone === "success"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400";
    const buttonColor =
        tone === "success"
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-600 hover:bg-gray-700";

    return (
        <div
            className={`w-full max-w-md rounded-lg bg-white dark:bg-[#111] p-8 text-center shadow-md border-t-4 ${borderColor}`}
        >
            <h1 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
                {title}
            </h1>
            <p className={`mb-6 text-sm font-medium ${messageColor}`}>{message}</p>
            <Link
                href={href}
                className={`block w-full rounded-md px-4 py-2 text-center text-white transition-colors ${buttonColor}`}
            >
                {cta}
            </Link>
        </div>
    );
}
