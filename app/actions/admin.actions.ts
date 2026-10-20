"use server";

import { api } from "@/app/lib/api/api";
import { logger } from "@/utils/logger";
import axios from "axios";
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
export interface UpdateListingResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}
export interface UpdateListingInput {
  title?: string;
  price?: number;
  stock?: number;
  sku?: string;
  status?: "ACTIVE" | "SUSPENDED" | "REJECTED";
}
export async function updateListing(
  id: number,
  input: UpdateListingInput,
): Promise<UpdateListingResult> {
  logger.info(input, "here is all the input form data");
  const payload = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined && v !== ""),
  );
  try {
    const response = await api.put(`/api/v1/seller-products/${id}`, payload);
    revalidatePath("/seller/products");
    revalidatePath(`/seller/products/${id}/edit`);
    return {
      success: true,
      message: response.data?.message || "Listing updated.",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const resp = error.response?.data;
      return {
        success: false,
        message: resp?.message || "Failed to update listing.",
        fieldErrors: resp?.errors,
      };
    }
    logger.error(`updateListing #${id} failed: ` + error);
    return { success: false, message: "Failed to update listing." };
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
