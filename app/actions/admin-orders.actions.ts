"use server";

import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";
import type { Order, OrderStatus } from "@/app/actions/orders.actions";

/**
 * Admin order views (read-only). GET /orders/ returns ALL orders for an admin
 * (the backend widens scope by role). No mutations here — admin order status
 * changes are out of scope for this dashboard.
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

/** All orders, optionally filtered by status, paginated. */
export async function getAllOrders(
  status?: OrderStatus,
  page = 1,
  per_page = DEFAULT_PER_PAGE,
): Promise<PagedOrders> {
  const safePage = page > 0 ? page : 1;
  try {
    const response = await api.get("/api/v1/orders", {
      params: {
        page: safePage,
        per_page,
        ...(status ? { status } : {}),
      },
    });
    const body = response.data ?? {};
    return {
      items: body.data || [],
      pagination: body.pagination || { page: safePage, per_page, total: 0 },
    };
  } catch (error) {
    logger.error("Gagal mengambil admin orders: " + error);
    return { items: [], pagination: { page: safePage, per_page, total: 0 } };
  }
}

/** A single order by id (admin can view any). */
export async function getOrderById(id: string | number): Promise<Order | null> {
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) return null;
  try {
    const response = await api.get(`/api/v1/orders/${orderId}`);
    return response.data?.data ?? null;
  } catch (error) {
    logger.error(`Gagal mengambil admin order #${id}: ` + error);
    return null;
  }
}
