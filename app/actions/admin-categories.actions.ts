"use server";

import { api } from "@/app/lib/api/api";
import { getAccessToken } from "@/app/lib/sessions";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";

/**
 * Admin category management (CRUD). Only ADMIN/SUPERADMIN may write; the backend
 * enforces that. Category names are stored lowercase (DB check constraint) and
 * must be unique — the create/update calls surface the backend's message on a
 * conflict.
 *
 * The GET list route has no @jwt_required on the backend, so it only parses the
 * token when one is present. We attach the Bearer token EXPLICITLY here (rather
 * than relying on the axios interceptor) so the admin always gets the `id`
 * field — without it the backend treats the request as anonymous.
 */

/** Authorization header with the current access token, or empty if none. */
async function authHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface AdminCategory {
  id?: number;
  name: string;
  created_at?: string;
}

export interface MutationResult {
  success: boolean;
  message: string;
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
}

export interface PagedCategories {
  items: AdminCategory[];
  pagination: Pagination;
}

// Categories are few, so use a smaller page size than other lists — this keeps
// the pagination control meaningful (e.g. 10 categories → 2 pages at 5/page).
const DEFAULT_PER_PAGE = 5;

export interface CategoryListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

/**
 * Paginated category list for the admin table (authed → includes id). Returns
 * the items plus the backend pagination meta so the page can render controls.
 */
export async function getAdminCategories(
  params: CategoryListParams = {},
): Promise<PagedCategories> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const per_page = params.per_page ?? DEFAULT_PER_PAGE;
  try {
    const response = await api.get("/api/v1/categories/", {
      params: {
        page,
        per_page,
        ...(params.search ? { search: params.search } : {}),
      },
      headers: await authHeader(),
    });
    const body = response.data ?? {};
    return {
      items: body.data || [],
      pagination: body.pagination || { page, per_page, total: 0 },
    };
  } catch (error) {
    logger.error("Gagal mengambil kategori (admin): " + error);
    return { items: [], pagination: { page, per_page, total: 0 } };
  }
}

export async function createCategory(name: string): Promise<MutationResult> {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, message: "Name is required." };
  try {
    const response = await api.post("/api/v1/categories/", { name: trimmed });
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: response.data?.message || "Category created.",
    };
  } catch (error) {
    const message = extractApiMessage(error, "Failed to create category.");
    logger.error(`createCategory("${trimmed}") failed: ` + error);
    return { success: false, message };
  }
}

export async function updateCategory(
  id: number,
  name: string,
): Promise<MutationResult> {
  const trimmed = name.trim();
  if (!trimmed) return { success: false, message: "Name is required." };
  try {
    const response = await api.put(`/api/v1/categories/${id}`, {
      name: trimmed,
    });
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: response.data?.message || "Category updated.",
    };
  } catch (error) {
    const message = extractApiMessage(error, "Failed to update category.");
    logger.error(`updateCategory(#${id}) failed: ` + error);
    return { success: false, message };
  }
}

/** Soft delete by default (backend default action). */
export async function deleteCategory(id: number): Promise<MutationResult> {
  try {
    const response = await api.delete(`/api/v1/categories/${id}`, {
      data: { action: "soft" },
    });
    revalidatePath("/admin/categories");
    return {
      success: true,
      message: response.data?.message || "Category deleted.",
    };
  } catch (error) {
    const message = extractApiMessage(error, "Failed to delete category.");
    logger.error(`deleteCategory(#${id}) failed: ` + error);
    return { success: false, message };
  }
}

function extractApiMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } })
      .response;
    if (resp?.data?.message) return resp.data.message;
  }
  return fallback;
}
