"use server";

import { api } from "@/app/lib/api/api";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import type { Order, OrderStatus } from "@/app/actions/orders.actions";
import { getAccessToken } from "@/app/lib/sessions";
/**
 * Seller "Incoming Orders" data layer.
 *
 * These hit GET /orders/ (NOT /orders/mine): for a SELLER the backend scopes
 * that endpoint to orders that contain the seller's own listings — i.e. orders
 * placed against them. Buyers' personal purchases live on /orders/mine instead.
 *
 * Status rules enforced by the backend (surfaced here, not re-implemented):
 *   - A seller can only act on PAID orders.
 *   - PAID -> COMPLETED (fulfill) or PAID -> CANCELED (reject).
 *   - Canceling restores stock + refunds server-side; the frontend only sends
 *     the status.
 */

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
}

export interface PagedOrders {
  items: Order[];
  pagination: Pagination;
}

const DEFAULT_PER_PAGE = 10;
async function authHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
/** Incoming orders for the seller, optionally filtered by status, paginated. */
export async function getIncomingOrders(
  status?: OrderStatus,
  page = 1,
  per_page = DEFAULT_PER_PAGE,
): Promise<PagedOrders> {
  const safePage = page > 0 ? page : 1;
  const headers = await authHeader();
  logger.info(headers, "fetch access token ");
  try {
    const response = await api.get("/api/v1/orders", {
      params: {
        page: safePage,
        per_page,
        ...(status ? { status } : {}),
      },
      headers: {
        ...headers,
      },
      _skipAuthRefresh: true,
    } as any);
    const body = response.data ?? {};
    return {
      items: body.data || [],
      pagination: body.pagination || { page: safePage, per_page, total: 0 },
    };
  } catch (error) {
    logger.error("Gagal mengambil incoming orders: " + error);
    return { items: [], pagination: { page: safePage, per_page, total: 0 } };
  }
}

/** A single incoming order by id (ownership/role checked server-side). */
export async function getIncomingOrderById(
  id: string | number,
): Promise<Order | null> {
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) return null;
  try {
    const response = await api.get(`/api/v1/orders/${orderId}`);
    return response.data?.data ?? null;
  } catch (error) {
    logger.error(`Gagal mengambil incoming order #${id}: ` + error);
    return null;
  }
}

export interface UpdateOrderResult {
  success: boolean;
  message: string;
}

/**
 * Advance an order's status (seller action). Only COMPLETED or CANCELED are
 * valid targets, and only from PAID — the backend rejects anything else with a
 * 400, whose message we surface verbatim.
 */
export async function updateOrderStatus(
  id: string | number,
  status: "COMPLETED" | "CANCELED",
): Promise<UpdateOrderResult> {
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return { success: false, message: "Invalid order id." };
  }
  try {
    const response = await api.put(`/api/v1/orders/${orderId}`, { status });
    // Refresh both the list and this detail page so the new status shows.
    revalidatePath("/seller/orders");
    revalidatePath(`/seller/orders/${orderId}`);
    return {
      success: true,
      message: response.data?.message || "Order updated.",
    };
  } catch (error: unknown) {
    // Surface the backend's business-rule message (e.g. invalid transition,
    // gateway refund refused) instead of a generic failure.
    const message = extractApiMessage(error, "Failed to update the order.");
    logger.error(`updateOrderStatus(#${id}, ${status}) failed: ` + error);
    return { success: false, message };
  }
}

/** Pull a human-readable message out of an axios error, with a fallback. */
function extractApiMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } })
      .response;
    if (resp?.data?.message) return resp.data.message;
  }
  return fallback;
}
