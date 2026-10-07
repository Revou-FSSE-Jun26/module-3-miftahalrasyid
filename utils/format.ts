/**
 * Format a numeric amount as Indonesian Rupiah, e.g. 10000 -> "Rp 10.000".
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/**
 * Turn a slug-ish title into a readable label.
 * Replaces underscores with spaces, e.g. "iphone_15_pro_max" -> "iphone 15 pro max".
 * Falls back to "Product" when nothing usable is passed.
 */
export function formatTitle(title?: string | null, fallback = "Product"): string {
  return (title || fallback).replace(/_/g, " ");
}
