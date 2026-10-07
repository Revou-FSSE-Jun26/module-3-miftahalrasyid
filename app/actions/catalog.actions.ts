"use server";
import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";

export type ProductStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "REJECTED";

export interface SellerProduct {
  // always returned (all roles)
  id: number;
  product_id: number;
  seller_id: number;
  title: string;
  slug: string;
  price: number;
  stock: number;
  status: ProductStatus;
  images: string[];
  created_at: string;

  // catalog fields (in browse response)
  brand?: string;
  name?: string;
  model?: string | null;
  color?: string | null;
  size?: string | null;

  // admin/seller only — absent for buyers/anon
  uuid?: string;
  sku?: string | null;

  // admin only — absent for seller & buyers/anon
  deleted_at?: string | null;
}

// Detail endpoint merges the catalog spec + seller name onto the listing.
export interface SellerProductDetail extends SellerProduct {
  // catalog fields (detail only)
  brand?: string;
  name?: string;
  description?: string | null;
  model?: string | null;
  color?: string | null;
  size?: string | null;
  // seller info (detail only)
  seller_name?: string;
  // category names (detail only)
  categories?: string[];
  // note: barcode, specifications not included in current detail endpoint
}

export async function getCatalogues(
  searchQuery?: string,
): Promise<SellerProduct[]> {
  try {
    const response = await api.get("/api/v1/seller-products", {
      params: searchQuery ? { search: searchQuery } : {},
    });

    return response.data?.data || [];
  } catch (error) {
    logger.error("Gagal mengambil data produk seller: " + error);
    return [];
  }
}

export async function getCatalogueById(
  id: string | number,
): Promise<SellerProductDetail | null> {
  try {
    const response = await api.get(`/api/v1/seller-products/${id}`);
    return response.data?.data ?? null;
  } catch (error) {
    logger.error(`Gagal mengambil detail produk seller #${id}: ` + error);
    return null;
  }
}
