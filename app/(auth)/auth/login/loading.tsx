export default function LoginLoading() {
    return (
        <div className="w-full max-w-[400px] mx-auto p-6 bg-white border border-gray-100 rounded-xl space-y-8">

            {/* 1. Google One-Tap Sign-In Row Skeleton */}
            <div className="animate-pulse flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                <div className="flex items-center gap-3">
                    {/* Avatar Circle */}
                    <div className="h-9 w-9 rounded-full bg-gray-200" />
                    {/* Sign in text block */}
                    <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-gray-200 rounded" />
                        <div className="h-3 w-40 bg-gray-200 rounded" />
                    </div>
                </div>
                {/* Google G Logo Block */}
                <div className="h-5 w-5 rounded-full bg-gray-200 mr-1" />
            </div>

            {/* 2. "OR" Separator Line Skeleton */}
            <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] w-full bg-gray-200" />
                <span className="text-xs font-semibold text-gray-300 select-none">OR</span>
                <div className="h-[1px] w-full bg-gray-200" />
            </div>

            {/* 3. Form Input Field Skeletons */}
            <div className="space-y-5">

                {/* Email Address Field */}
                <div className="space-y-2">
                    {/* Label track */}
                    <div className="h-3 w-20 bg-gray-200 rounded ml-1" />
                    {/* Input field box */}
                    <div className="animate-pulse h-12 w-full border border-gray-200 rounded-xl bg-gray-50/50" />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    {/* Label track */}
                    <div className="h-3 w-16 bg-gray-200 rounded ml-1" />
                    {/* Input field box */}
                    <div className="animate-pulse h-12 w-full border border-gray-200 rounded-xl bg-gray-50/50" />
                </div>

                <div className="animate-pulse h-12 w-full bg-indigo-200 rounded-xl" />

            </div>

        </div>
    );
}
