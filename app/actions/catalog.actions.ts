"use server";
import { publicGet } from "@/app/lib/publicFetch";
import { logger } from "@/utils/logger";

interface ListEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
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
export interface Pagination {
  page: number;
  per_page: number;
  total: number;
}
export interface PagedListings {
  items: SellerProduct[];
  pagination: Pagination;
}
const DEFAULT_PER_PAGE = 10;

export async function getCatalogues(
  params: CatalogueFilters = {},
): Promise<PagedListings> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const per_page = params.per_page ?? DEFAULT_PER_PAGE;

  try {
    // PERBAIKAN: Kirim flat object langsung sebagai parameter kedua publicGet
    const body = await publicGet<ListEnvelope<SellerProduct>>(
      "/api/v1/seller-products",
      {
        sort: "-created_at",
        page: String(page), // Konversi ke String jika QueryValue mewajibkan string
        per_page: String(per_page), // Konversi ke String jika QueryValue mewajibkan string
        ...(params.search ? { search: params.search } : {}),
        ...(params.category_name
          ? { category_name: params.category_name }
          : {}),
      },
    );

    return {
      items: body.data || [],
      pagination: body.pagination || { page, per_page, total: 0 },
    };
  } catch (error) {
    logger.error("Gagal mengambil data produk seller: " + error);
    return { items: [], pagination: { page, per_page, total: 0 } };
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
export async function getCatalogueBySlug(
  slug: string,
): Promise<SellerProductDetail | null> {
  try {
    const body = await publicGet<ItemEnvelope<SellerProductDetail>>(
      `/api/v1/seller-products/slug/${slug}`,
    );
    return body.data ?? null;
  } catch (error) {
    logger.error(`Gagal mengambil detail produk seller #${slug}: ` + error);
    return null;
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

// export async function getCatalogueById(
//   id: string | number,
// ): Promise<SellerProductDetail | null> {
//   const API_BASE =
//     process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

//   try {
//     const res = await fetch(
//       `${API_BASE.replace(/\/$/, "")}/api/v1/seller-products/${id}`,
//     );

//     if (!res.ok) {
//       logger.error(
//         `Server Flask merespon dengan status: ${res.status} untuk ID #${id}`,
//       );
//       return null;
//     }

//     const body = await res.json();
//     return body.data ?? null;
//   } catch (error) {
//     logger.error(`Gagal mengambil detail produk seller #${id}: ` + error);
//     return null;
//   }
// }
