"use server";

import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";

// ---------------------------------------------------------------------------
// Orders (authenticated — goes through axios `api` for the Bearer token)
// ---------------------------------------------------------------------------
export type OrderStatus = "PENDING" | "PAID" | "COMPLETED" | "CANCELED";

export interface OrderItem {
  id?: number;
  seller_product_id?: number;
  product_id?: number;
  product_name?: string;
  quantity?: number;
  compound_price?: number;
}

export interface Order {
  id: number;
  name?: string;
  status: OrderStatus;
  subtotal?: number;
  tax_amount?: number;
  total: number;
  created_at: string;
  items?: OrderItem[];
}

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  try {
    const response = await api.get("/api/v1/orders", {
      params: status ? { status } : {},
    });
    return response.data?.data || [];
  } catch (error) {
    logger.error("Gagal mengambil orders: " + error);
    return [];
  }
}

/**
 * The caller's OWN placed orders (what I bought), via GET /orders/mine.
 * Scoped to user_id == me regardless of role — so a seller/admin still sees
 * only their personal purchases on the buyer "My Orders" page.
 */
export async function getMyOrders(status?: OrderStatus): Promise<Order[]> {
  try {
    const response = await api.get("/api/v1/orders/mine", {
      params: status ? { status } : {},
    });
    return response.data?.data || [];
  } catch (error) {
    logger.error("Gagal mengambil my orders: " + error);
    return [];
  }
}

/**
 * Checkout: turn the server cart into ONE order via POST /orders/.
 * The cart itself lives in `cart_items` (see cart.actions.ts); the caller passes
 * the lines to buy and the backend creates a single PENDING order from them.
 * The cart is emptied separately (clearCart) after a successful order.
 */
export async function createOrderFromCart(
  items: { seller_product_id: number; quantity: number }[],
): Promise<{ success: boolean; message: string; id?: number }> {
  if (!items.length) {
    return { success: false, message: "Your cart is empty." };
  }
  try {
    const response = await api.post("/api/v1/orders/", {
      name: `cart order ${Date.now()}`,
      items,
    });
    return {
      success: true,
      message: response.data?.message || "Order created.",
      id: response.data?.data?.id,
    };
  } catch (error) {
    logger.error("createOrderFromCart failed: " + error);
    return { success: false, message: "Failed to place order." };
  }
}
