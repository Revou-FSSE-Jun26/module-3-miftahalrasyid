import { getUsers, type Role } from "@/app/actions/admin-users.actions";
import { getSession } from "@/app/lib/sessions";
import { canAccessSuperadmin } from "@/app/lib/roles";
import { UserClient } from "@/components/dashboard/UserClient";
import { roleBadge } from "@/components/dashboard/roleBadge";
import { Pagination } from "@/components/dashboard/Pagination";
import Link from "next/link";

export const metadata = {
  title: "Users",
  description: "Manage platform user accounts.",
};

const ROLE_TABS: { label: string; value?: Role }[] = [
  { label: "All" },
  { label: "Buyers", value: "BUYER" },
  { label: "Sellers", value: "SELLER" },
  { label: "Admins", value: "ADMIN" },
];

const VALID_ROLES: Role[] = ["BUYER", "SELLER", "ADMIN", "SUPERADMIN"];

interface PageProps {
  searchParams: Promise<{
    role?: string;
    active?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { role: roleParam, active, search, page: pageParam } = await searchParams;
  const session = await getSession();
  const isSuperadmin = canAccessSuperadmin(session?.roles ?? []);

  const activeRole = VALID_ROLES.includes(roleParam as Role)
    ? (roleParam as Role)
    : undefined;
  const isActive =
    active === "true" ? true : active === "false" ? false : undefined;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const { items: users, pagination } = await getUsers({
    role: activeRole,
    is_active: isActive,
    search,
    page,
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Users
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Activate or deactivate accounts and promote buyers to sellers.
          </p>
        </div>
        {isSuperadmin && (
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            New admin
          </Link>
        )}
      </div>

      {/* Search */}
      <form
        action="/admin/users"
        method="get"
        className="mb-4 flex gap-2 max-w-md"
      >
        {activeRole && <input type="hidden" name="role" value={activeRole} />}
        {isActive !== undefined && (
          <input type="hidden" name="active" value={String(isActive)} />
        )}
        <input
          type="search"
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search by username or email"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
        >
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {ROLE_TABS.map((tab) => {
          const selected = activeRole === tab.value;
          const params = new URLSearchParams();
          if (tab.value) params.set("role", tab.value);
          if (isActive !== undefined) params.set("active", String(isActive));
          if (search) params.set("search", search);
          const href = `/admin/users${params.toString() ? `?${params}` : ""}`;
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors duration-150 ${selected
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                }`}
            >
              {tab.label}
            </Link>
          );
        })}

        <span className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-800" />

        {[
          { label: "Active", value: true },
          { label: "Inactive", value: false },
        ].map((opt) => {
          const selected = isActive === opt.value;
          const params = new URLSearchParams();
          if (activeRole) params.set("role", activeRole);
          // Toggle: clicking an active filter clears it.
          if (!selected) params.set("active", String(opt.value));
          if (search) params.set("search", search);
          const href = `/admin/users${params.toString() ? `?${params}` : ""}`;
          return (
            <Link
              key={opt.label}
              href={href}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors duration-150 ${selected
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-gray-600 dark:text-gray-400">
            No users match this filter.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="md:hidden space-y-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {user.username || user.email}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(user.roles ?? []).map((r) => (
                    <span
                      key={r}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(r)}`}
                    >
                      {r}
                    </span>
                  ))}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <UserClient user={user} />
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-sm text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Roles</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="text-sm align-middle">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.username || user.email}
                      </p>
                      <p className="text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {(user.roles ?? []).map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(r)}`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                          }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <UserClient user={user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination
        page={pagination.page}
        perPage={pagination.per_page}
        total={pagination.total}
        basePath="/admin/users"
        query={{
          role: activeRole,
          active: isActive !== undefined ? String(isActive) : undefined,
          search,
        }}
      />
    </div>
  );
}
