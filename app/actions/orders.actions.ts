"use server";

import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";

// ---------------------------------------------------------------------------
// Orders (authenticated — goes through axios `api` for the Bearer token)
// ---------------------------------------------------------------------------
export type OrderStatus = "PENDING" | "PAID" | "COMPLETED" | "CANCELED";

export interface OrderItem {
  title?: string;
  quantity?: number;
  compound_price?: number;
}

export interface Order {
  id: number;
  name?: string;
  status: OrderStatus;
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
