"use server";

import { publicGet } from "@/app/lib/publicFetch";
import { logger } from "@/utils/logger";

// ---------------------------------------------------------------------------
// Categories (public read)
// ---------------------------------------------------------------------------
export interface Category {
  id?: number; // present for authed roles; absent for guests
  name: string;
  created_at?: string;
}

interface ListEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
}

export async function getCategories(searchQuery?: string): Promise<Category[]> {
  try {
    const body = await publicGet<ListEnvelope<Category>>("/api/v1/categories", {
      search: searchQuery,
    });
    return body.data || [];
  } catch (error) {
    logger.error("Gagal mengambil kategori: " + error);
    return [];
  }
}

/**
 * Authenticated categories fetch (via axios) so the response includes `id`,
 * which the public/guest endpoint omits. Used for category selects in forms
 * that submit `category_ids`.
 */
export async function getCategoriesForSelect(): Promise<Category[]> {
  const { api } = await import("@/app/lib/api");
  try {
    const response = await api.get("/api/v1/categories");
    return response.data?.data || [];
  } catch (error) {
    logger.error("Gagal mengambil kategori (authed): " + error);
    return [];
  }
}
