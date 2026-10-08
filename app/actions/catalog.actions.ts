"use server";
import { publicGet } from "@/app/lib/publicFetch";
import { logger } from "@/utils/logger";

interface ListEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
}

interface ItemEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

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

export interface CatalogueFilters {
  search?: string;
  category_id?: number;
  category_name?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  per_page?: number;
}

export async function getCatalogues(
  filters: CatalogueFilters = {},
): Promise<SellerProduct[]> {
  try {
    const body = await publicGet<ListEnvelope<SellerProduct>>(
      "/api/v1/seller-products",
      // publicGet's buildUrl skips undefined/null/"" params automatically.
      { ...filters },
    );
    return body.data || [];
  } catch (error) {
    logger.error("Gagal mengambil data produk seller: " + error);
    return [];
  }
}

/**
 * Top-N most-ordered listings for the home swiper.
 * Uses the backend's `sort=-popular` (units sold desc).
 */
export async function getPopularCatalogues(
  limit = 5,
): Promise<SellerProduct[]> {
  try {
    const body = await publicGet<ListEnvelope<SellerProduct>>(
      "/api/v1/seller-products",
      { sort: "-popular", per_page: limit },
    );
    return body.data || [];
  } catch (error) {
    logger.error("Gagal mengambil produk terpopuler: " + error);
    return [];
  }
}

export async function getCatalogueById(
  id: string | number,
): Promise<SellerProductDetail | null> {
  try {
    const body = await publicGet<ItemEnvelope<SellerProductDetail>>(
      `/api/v1/seller-products/${id}`,
    );
    return body.data ?? null;
  } catch (error) {
    logger.error(`Gagal mengambil detail produk seller #${id}: ` + error);
    return null;
  }
}
