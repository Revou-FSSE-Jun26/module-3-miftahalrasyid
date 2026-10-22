"use client";

import { createAdmin } from "@/app/actions/admin-users.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

/**
 * Create-a-new-admin form (superadmin only — the page guards access). Posts a
 * brand-new account with the ADMIN role; this is not a promotion of an existing
 * user.
 */
export function NewAdminForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const ageNum = Number(age);
    startTransition(async () => {
      const result = await createAdmin({
        email: email.trim(),
        age: ageNum,
        password,
      });
      if (result.success) {
        toast.success(result.message || "Admin created.");
        router.push("/admin/users?role=ADMIN");
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 border border-gray-200 dark:border-gray-800 rounded-xl p-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Age
        </label>
        <input
          type="number"
          min={1}
          required
          value={age}
          onChange={(e) => setAge(e.target.value)}
          disabled={pending}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Temporary password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 rounded-md px-3 py-2"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-150"
      >
        {pending ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}
