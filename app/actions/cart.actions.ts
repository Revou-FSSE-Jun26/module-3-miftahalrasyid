"use server";

import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";

// ---------------------------------------------------------------------------
// Cart (authenticated — server-side via axios `api`, which attaches the Bearer
// token from the httpOnly cookie). Backed by the Flask `cart_items` table.
// The client never calls Flask directly; it goes through these server actions.
// ---------------------------------------------------------------------------

/** One enriched cart line as returned by GET /api/v1/cart/. */
export interface CartLine {
  id: number;
  seller_product_id: number;
  product_id: number | null;
  title: string | null;
  price: number;
  quantity: number;
  line_total: number;
  stock: number;
  available: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface CartSummary {
  item_count: number;
  subtotal: number;
  has_unavailable: boolean;
}

export interface CartResponse {
  items: CartLine[];
  summary: CartSummary;
}

export interface CartActionResult {
  success: boolean;
  message: string;
}

const EMPTY: CartResponse = {
  items: [],
  summary: { item_count: 0, subtotal: 0, has_unavailable: false },
};

/** Pull a human-readable message out of an axios error, with a fallback. */
function errMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    if (resp?.data?.message) return resp.data.message;
  }
  return fallback;
}

/** Fetch the caller's cart (lines + summary). Returns an empty cart on error. */
export async function getCart(): Promise<CartResponse> {
  try {
    const response = await api.get("/api/v1/cart/", { params: { per_page: 30 } });
    return {
      items: response.data?.data ?? [],
      summary: response.data?.summary ?? EMPTY.summary,
    };
  } catch (error) {
    logger.error("getCart failed: " + error);
    return EMPTY;
  }
}

/** Add a listing to the cart (bumps quantity if already present). */
export async function addToCart(
  sellerProductId: number,
  quantity = 1,
): Promise<CartActionResult> {
  try {
    const response = await api.post("/api/v1/cart/items", {
      seller_product_id: sellerProductId,
      quantity,
    });
    return { success: true, message: response.data?.message || "Item added to cart" };
  } catch (error) {
    logger.error("addToCart failed: " + error);
    return { success: false, message: errMessage(error, "Failed to add item to cart") };
  }
}

/** Set an absolute quantity for a cart line. */
export async function updateCartItem(
  cartItemId: number,
  quantity: number,
): Promise<CartActionResult> {
  try {
    const response = await api.patch(`/api/v1/cart/items/${cartItemId}`, { quantity });
    return { success: true, message: response.data?.message || "Cart updated" };
  } catch (error) {
    logger.error("updateCartItem failed: " + error);
    return { success: false, message: errMessage(error, "Failed to update cart item") };
  }
}

/** Remove a single line from the cart. */
export async function removeCartItem(cartItemId: number): Promise<CartActionResult> {
  try {
    const response = await api.delete(`/api/v1/cart/items/${cartItemId}`);
    return { success: true, message: response.data?.message || "Item removed" };
  } catch (error) {
    logger.error("removeCartItem failed: " + error);
    return { success: false, message: errMessage(error, "Failed to remove item") };
  }
}

/** Empty the cart. */
export async function clearCart(): Promise<CartActionResult> {
  try {
    const response = await api.delete("/api/v1/cart/");
    return { success: true, message: response.data?.message || "Cart cleared" };
  } catch (error) {
    logger.error("clearCart failed: " + error);
    return { success: false, message: errMessage(error, "Failed to clear cart") };
  }
}
