export default function CreateAccountLoading() {
    return (
        <div className="w-full max-w-[450px] mx-auto p-6 bg-white border border-gray-100 rounded-xl space-y-6">

            {/* 1. Header Typography (Kept stable to prevent text flashing) */}
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
                <p className="text-sm text-gray-500">Already have an account? Sign in</p>
            </div>

            {/* 2. Google Identity One-Tap Skeleton Row */}
            <div className="animate-pulse flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                <div className="flex items-center gap-3">
                    {/* Mock Avatar */}
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    {/* Mock Text Strings */}
                    <div className="space-y-1.5">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                        <div className="h-2.5 w-36 bg-gray-200 rounded" />
                    </div>
                </div>
                {/* Mock Google Logo Accent */}
                <div className="h-5 w-5 rounded-full bg-gray-200 mr-1" />
            </div>

            {/* 3. "OR" Separator Layout Tracking */}
            <div className="flex items-center gap-4 py-1">
                <div className="h-[1px] w-full bg-gray-100" />
                <span className="text-xs font-semibold text-gray-300 select-none">OR</span>
                <div className="h-[1px] w-full bg-gray-100" />
            </div>

            {/* 4. Form Field Track Skeletons */}
            <div className="space-y-5">

                {/* Email Address Input Block */}
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 rounded ml-1" />
                    <div className="animate-pulse h-12 w-full border border-gray-200 rounded-xl bg-gray-50/50" />
                </div>

                {/* Age Input Block */}
                <div className="space-y-2">
                    <div className="h-3 w-10 bg-gray-200 rounded ml-1" />
                    <div className="animate-pulse h-12 w-full border border-gray-200 rounded-xl bg-gray-50/50" />
                </div>

                {/* Password Input Block */}
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded ml-1" />
                    <div className="animate-pulse h-12 w-full border border-gray-200 rounded-xl bg-gray-50/50" />
                </div>

                {/* Confirm Password Input Block */}
                <div className="space-y-2">
                    <div className="h-3 w-32 bg-gray-200 rounded ml-1" />
                    <div className="animate-pulse h-12 w-full border border-gray-200 rounded-xl bg-gray-50/50" />
                </div>

            </div>

            {/* 5. Terms & Conditions Checkbox Row */}
            <div className="animate-pulse flex items-center gap-2 py-1">
                <div className="h-4 w-4 rounded border border-gray-200 bg-gray-50/50" />
                <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>

            {/* 6. Main Action Submit Button Skeleton */}
            <div className="animate-pulse h-12 w-full bg-indigo-200 rounded-xl" />

        </div>
    );
}
