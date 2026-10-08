import { ReactNode } from "react";

/**
 * Shared dashboard layout skeleton for the seller and admin shells.
 * Structure is identical (top navbar + left sidebar + main); only the
 * navbar/sidebar content differs, passed in as props.
 */
export function DashboardShell({
  navbar,
  sidebar,
  children,
}: {
  navbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {navbar}
      <div className="flex flex-1">
        <aside className="hidden md:flex w-60 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]">
          {sidebar}
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
