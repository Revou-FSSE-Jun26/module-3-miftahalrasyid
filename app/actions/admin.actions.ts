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
interface ListEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
}
export interface ListingListParams {
  search?: string;
  page?: number;
  per_page?: number;
}
const DEFAULT_PER_PAGE = 10;
export interface Pagination {
  page: number;
  per_page: number;
  total: number;
}
export interface PagedListings {
  items: CatalogProduct[];
  pagination: Pagination;
}
/**
 * List catalog products via GET /api/v1/admin/products — the admin catalog
 * view, which includes inactive and soft-deleted rows (admin/superadmin only).
 * Authenticated via the axios `api` instance.
 */
export async function getCatalogProducts(
  params: ListingListParams,
): Promise<PagedListings> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const per_page = params.per_page ?? DEFAULT_PER_PAGE;
  try {
    const response = await api.get("/api/v1/admin/products", {
      params: {
        sort: "-created_at",
        page,
        per_page,
        ...(params.search ? { search: params.search } : {}),
      },
    });
    const body = response.data ?? {};
    // logger.info(body, "fetch body");
    return {
      items: body.data || [],
      pagination: body.pagination || { page, per_page, total: 0 },
    };
  } catch (error) {
    logger.error("Gagal mengambil catalog products: " + error);
    return { items: [], pagination: { page, per_page, total: 0 } };
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
