"use server";

import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import axios from "axios";
import type { SellerProduct } from "@/app/actions/catalog.actions";

export interface CreateListingInput {
  // catalog (find-or-create)
  brand: string;
  name: string;
  description?: string;
  model?: string;
  color?: string;
  size?: string;
  barcode?: string;
  category_ids?: number[];
  // listing
  title: string;
  price: number;
  stock?: number;
  sku?: string;
}

export interface CreateListingResult {
  success: boolean;
  message: string;
  /** The new listing id (for the follow-up image upload step). */
  id?: number;
  /** Per-field errors from the API, if any. */
  fieldErrors?: Record<string, string[]>;
}

/**
 * Create a seller listing via POST /api/v1/seller-products/.
 * The backend find-or-creates the catalog product and starts the listing as
 * PENDING. Returns the new listing id so the caller can then upload images
 * (images attach to an existing listing — see uploadListingImage).
 */
export async function createListing(
  input: CreateListingInput,
): Promise<CreateListingResult> {
  // Strip empty optionals so we don't send "" for unset fields.
  const payload = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined && v !== ""),
  );

  try {
    const response = await api.post("/api/v1/seller-products/", payload);
    const data = response.data?.data;
    revalidatePath("/seller/products");
    return {
      success: true,
      message: response.data?.message || "Listing created.",
      id: data?.id,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const resp = error.response?.data;
      return {
        success: false,
        message: resp?.message || "Failed to create listing.",
        fieldErrors: resp?.errors,
      };
    }
    logger.error("createListing failed: " + error);
    return { success: false, message: "Failed to create listing." };
  }
}

/**
 * List the caller's own listings via GET /api/v1/seller-products/mine.
 * The backend scopes this by role: a SELLER sees only their own listings,
 * an ADMIN/SUPERADMIN sees all. Authenticated — goes through the axios `api`
 * instance so the Bearer token is attached.
 */
export async function getMyListings(search?: string): Promise<SellerProduct[]> {
  try {
    // Backend sorts newest-first by default; we pass it explicitly. This works
    // across real pagination (unlike a client-side sort of a single page).
    const response = await api.get("/api/v1/seller-products/mine", {
      params: { sort: "-created_at", ...(search ? { search } : {}) },
    });
    return response.data?.data || [];
  } catch (error) {
    logger.error("Gagal mengambil listing: " + error);
    return [];
  }
}

/**
 * Fetch a single listing by id AS THE AUTHENTICATED CALLER (via axios), so the
 * owner/admin can view non-ACTIVE listings (PENDING/INACTIVE/etc). The public
 * getCatalogueById uses an unauthenticated fetch and 404s on non-ACTIVE rows,
 * so it can't be used for the owner's edit page.
 */
export async function getMyListingById(
  id: string | number,
): Promise<SellerProduct | null> {
  try {
    const response = await api.get(`/api/v1/seller-products/${id}`);
    return response.data?.data ?? null;
  } catch (error) {
    logger.error(`Gagal mengambil listing #${id}: ` + error);
    return null;
  }
}

export interface UpdateListingInput {
  title?: string;
  price?: number;
  stock?: number;
  sku?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateListingResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Update a listing's own fields via PUT /api/v1/seller-products/<id>.
 * Seller can edit title/price/stock/sku and toggle ACTIVE<->INACTIVE; the
 * backend enforces the field + status-transition rules.
 */
export async function updateListing(
  id: number,
  input: UpdateListingInput,
): Promise<UpdateListingResult> {
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
 * Upload one image to a listing via POST /api/v1/uploads/ (multipart).
 * resource = "seller_products", resource_id = listing id.
 * Constraints enforced by the backend: png/jpg/jpeg/webp, <= 2MB, max 4 images.
 * The file is passed from a client component as part of a FormData.
 */
export async function uploadListingImage(
  listingId: number,
  formData: FormData,
): Promise<{ success: boolean; message: string; imagePath?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "No file provided." };
  }

  const payload = new FormData();
  payload.append("resource", "seller_products");
  payload.append("resource_id", String(listingId));
  payload.append("file", file);

  try {
    // Let axios set the multipart boundary; override the JSON default header.
    const response = await api.post("/api/v1/uploads/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    revalidatePath(`/seller/products/${listingId}/edit`);
    return {
      success: true,
      message: response.data?.message || "Image uploaded.",
      imagePath: response.data?.image_path,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || "Upload failed.",
      };
    }
    logger.error("uploadListingImage failed: " + error);
    return { success: false, message: "Upload failed." };
  }
}

/**
 * Delete one image from a listing via DELETE /api/v1/uploads/ (JSON body).
 * `filename` is the bare filename (not the full relative path).
 */
export async function deleteListingImage(
  listingId: number,
  filename: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete("/api/v1/uploads/", {
      data: {
        resource: "seller_products",
        resource_id: listingId,
        filename,
      },
    });
    revalidatePath(`/seller/products/${listingId}/edit`);
    return {
      success: true,
      message: response.data?.message || "Image deleted.",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || "Delete failed.",
      };
    }
    logger.error("deleteListingImage failed: " + error);
    return { success: false, message: "Delete failed." };
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
