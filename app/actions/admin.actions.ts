"use server";

import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";

/** Catalog product (the shared spec; no price/stock/status). */
export interface CatalogProduct {
  id: number;
  uuid?: string;
  brand: string;
  name: string;
  description?: string | null;
  model?: string | null;
  color?: string | null;
  size?: string | null;
  barcode?: string | null;
  specifications?: Record<string, unknown> | null;
  categories?: string[];
  created_at?: string;
  deleted_at?: string | null;
}

/**
 * List catalog products via GET /api/v1/admin/products — the admin catalog
 * view, which includes inactive and soft-deleted rows (admin/superadmin only).
 * Authenticated via the axios `api` instance.
 */
export async function getCatalogProducts(
  search?: string,
): Promise<CatalogProduct[]> {
  try {
    const response = await api.get("/api/v1/admin/products", {
      params: search ? { search } : {},
    });
    return response.data?.data || [];
  } catch (error) {
    logger.error("Gagal mengambil catalog products: " + error);
    return [];
  }
}

/**
 * Delete a catalog product (DELETE /api/v1/products/<id>).
 * action: "soft" (admin) | "hard" (superadmin only, permanent).
 */
export async function deleteCatalogProduct(
  id: number,
  action: "soft" | "hard" = "soft",
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/api/v1/products/${id}`, {
      data: { action },
    });
    revalidatePath("/admin/products");
    return {
      success: true,
      message: response.data?.message || "Product deleted.",
    };
  } catch (error) {
    logger.error(`Gagal menghapus catalog product #${id}: ` + error);
    return { success: false, message: "Failed to delete product." };
  }
}
