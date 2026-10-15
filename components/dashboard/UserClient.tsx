"use client";

import {
  setUserActive,
  promoteToSeller,
  type AdminUser,
} from "@/app/actions/admin-users.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Client row-actions for a single user: activate/deactivate and promote a buyer
 * to seller. Admin promotion is intentionally NOT offered here — new admins are
 * created via the superadmin "New admin" form, not promoted.
 */
export function UserClient({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const roles = user.roles ?? [];
  const isActive = user.is_active ?? false;
  const isBuyerOnly =
    roles.includes("BUYER") &&
    !roles.includes("SELLER") &&
    !roles.includes("ADMIN") &&
    !roles.includes("SUPERADMIN");

  function toggleActive() {
    setError(null);
    if (isActive) {
      const ok = window.confirm(`Deactivate ${user.email ?? "this user"}?`);
      if (!ok) return;
    }
    startTransition(async () => {
      const result = await setUserActive(user.id, !isActive);
      if (result.success) router.refresh();
      else setError(result.message);
    });
  }

  function promote() {
    setError(null);
    startTransition(async () => {
      const result = await promoteToSeller(user.id, roles);
      if (result.success) router.refresh();
      else setError(result.message);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={toggleActive}
          disabled={pending}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-150 disabled:opacity-50 ${isActive
            ? "text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            : "text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            }`}
        >
          {pending ? "…" : isActive ? "Deactivate" : "Activate"}
        </button>

        {isBuyerOnly && (
          <button
            type="button"
            onClick={promote}
            disabled={pending}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors duration-150"
          >
            Make seller
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
