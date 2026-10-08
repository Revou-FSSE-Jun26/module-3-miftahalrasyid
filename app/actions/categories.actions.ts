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
    const body = await publicGet<ListEnvelope<Category>>(
      "/api/v1/categories",
      { search: searchQuery },
    );
    return body.data || [];
  } catch (error) {
    logger.error("Gagal mengambil kategori: " + error);
    return [];
  }
}
