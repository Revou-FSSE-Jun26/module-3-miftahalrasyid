"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarLink {
  label: string;
  href: string;
}

/**
 * Sidebar navigation list with active-route highlighting.
 * Reused by the seller and admin shells — each passes its own links.
 */
export function SidebarNav({
  title,
  links,
}: {
  title: string;
  links: SidebarLink[];
}) {
  const pathname = usePathname();

  return (
    <nav className="w-full p-4">
      <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>
      <ul className="space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
