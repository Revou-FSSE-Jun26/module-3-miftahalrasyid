import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  /** Extra classes merged after the base card styles. */
  className?: string;
  /** Render as a different element (default: div). */
  as?: "div" | "article" | "section";
}

/**
 * Generic surface wrapper used across the site for "card" UI.
 * Provides the shared rounded/border/background styling; callers pass extra
 * classes for layout (padding, flex, hover, etc).
 */
export function Card({ children, className = "", as = "div" }: CardProps) {
  const base =
    "bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800";
  const Tag = as;
  return <Tag className={`${base} ${className}`}>{children}</Tag>;
}
