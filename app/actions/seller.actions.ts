"use server";

import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import type { SellerProduct } from "@/app/actions/catalog.actions";

/**
 * List the caller's own listings via GET /api/v1/seller-products/mine.
 * The backend scopes this by role: a SELLER sees only their own listings,
 * an ADMIN/SUPERADMIN sees all. Authenticated — goes through the axios `api`
 * instance so the Bearer token is attached.
 */
export async function getMyListings(search?: string): Promise<SellerProduct[]> {
  try {
    const response = await api.get("/api/v1/seller-products/mine", {
      params: search ? { search } : {},
    });
    return response.data?.data || [];
  } catch (error) {
    logger.error("Gagal mengambil listing: " + error);
    return [];
  }
}

/**
 * Soft-delete a listing (DELETE /api/v1/seller-products/<id> {"action":"soft"}).
 * Seller may delete own; admin any. Returns a simple result for the UI.
 */
export async function softDeleteListing(
  id: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/api/v1/seller-products/${id}`, {
      data: { action: "soft" },
    });
    revalidatePath("/seller/products");
    revalidatePath("/admin/seller-products");
    return {
      success: true,
      message: response.data?.message || "Listing deleted.",
    };
  } catch (error) {
    logger.error(`Gagal menghapus listing #${id}: ` + error);
    return { success: false, message: "Failed to delete listing." };
  }
}
