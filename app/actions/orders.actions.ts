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
 * Cart = the buyer's PENDING order(s). The backend scopes /orders to the caller
 * and we filter to PENDING. A buyer can have more than one PENDING order, so
 * this returns all of them; the cart page flattens their items.
 */
export async function getCart(): Promise<Order[]> {
  return getOrders("PENDING");
}

/**
 * Checkout: create ONE order from the device cart via POST /orders/.
 * The backend supports multiple items in a single order, so the whole cart
 * becomes a single PENDING order.
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
