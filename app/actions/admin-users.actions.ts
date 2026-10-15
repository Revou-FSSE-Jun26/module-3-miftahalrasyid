"use server";

import { api } from "@/app/lib/api";
import { getAccessToken } from "@/app/lib/sessions";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";

/** Authorization header with the current access token, or empty if none. */
async function authHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Admin user management.
 *
 * Rules enforced here + by the backend:
 *   - Activate / deactivate via PUT /users/<id> { is_active }.
 *   - Promote a BUYER to seller via PUT /users/<id> { roles: ["BUYER","SELLER"] }.
 *     Promotion is ONLY buyer -> buyer+seller. No admin promotion via roles.
 *   - Creating an admin is a SUPERADMIN-only action and uses POST /users/ with
 *     roles: ["ADMIN"] — a brand-new account, not a promotion.
 */

export type Role = "BUYER" | "SELLER" | "ADMIN" | "SUPERADMIN";

export interface AdminUser {
  id: number;
  username?: string;
  email?: string;
  age?: number;
  roles?: Role[];
  is_active?: boolean;
  provider?: string;
  created_at?: string;
}

export interface UserFilters {
  search?: string;
  role?: Role;
  is_active?: boolean;
  page?: number;
  per_page?: number;
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

export interface PagedUsers {
  items: AdminUser[];
  pagination: Pagination;
}

const DEFAULT_PER_PAGE = 10;

export async function getUsers(filters: UserFilters = {}): Promise<PagedUsers> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const per_page = filters.per_page ?? DEFAULT_PER_PAGE;
  try {
    const params: Record<string, string | number | boolean> = {
      page,
      per_page,
    };
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.is_active !== undefined) params.is_active = filters.is_active;

    const response = await api.get("/api/v1/users/", {
      params,
      headers: await authHeader(),
    });
    const body = response.data ?? {};
    return {
      items: body.data || [],
      pagination: body.pagination || { page, per_page, total: 0 },
    };
  } catch (error) {
    logger.error("Gagal mengambil users (admin): " + error);
    return { items: [], pagination: { page, per_page, total: 0 } };
  }
}

/** Toggle a user's active state. */
export async function setUserActive(
  id: number,
  isActive: boolean,
): Promise<MutationResult> {
  try {
    const response = await api.put(`/api/v1/users/${id}`, {
      is_active: isActive,
    });
    revalidatePath("/admin/users");
    return {
      success: true,
      message:
        response.data?.message ||
        (isActive ? "User activated." : "User deactivated."),
    };
  } catch (error) {
    const message = extractApiMessage(error, "Failed to update the user.");
    logger.error(`setUserActive(#${id}, ${isActive}) failed: ` + error);
    return { success: false, message };
  }
}

/**
 * Promote a BUYER to also be a SELLER. Sends the full target role set
 * ["BUYER","SELLER"] per the backend's role-replacement semantics. Refuses if
 * the user is already a seller or carries elevated roles (admin promotion is
 * not allowed through this path).
 */
export async function promoteToSeller(
  id: number,
  currentRoles: Role[] = [],
): Promise<MutationResult> {
  if (currentRoles.includes("SELLER")) {
    return { success: false, message: "User is already a seller." };
  }
  if (currentRoles.includes("ADMIN") || currentRoles.includes("SUPERADMIN")) {
    return {
      success: false,
      message: "Only a buyer account can be promoted to seller.",
    };
  }
  try {
    const response = await api.put(`/api/v1/users/${id}`, {
      roles: ["BUYER", "SELLER"],
    });
    revalidatePath("/admin/users");
    return {
      success: true,
      message: response.data?.message || "User promoted to seller.",
    };
  } catch (error) {
    const message = extractApiMessage(error, "Failed to promote the user.");
    logger.error(`promoteToSeller(#${id}) failed: ` + error);
    return { success: false, message };
  }
}

export interface CreateAdminInput {
  email: string;
  age: number;
  password: string;
}

/**
 * Create a new ADMIN account (SUPERADMIN only — enforced by the page guard and
 * by the backend). Uses POST /users/ with roles: ["ADMIN"], is_active: true.
 */
export async function createAdmin(
  input: CreateAdminInput,
): Promise<MutationResult> {
  const email = input.email.trim();
  if (!email) return { success: false, message: "Email is required." };
  if (!input.password)
    return { success: false, message: "Password is required." };
  if (!Number.isInteger(input.age) || input.age <= 0) {
    return { success: false, message: "A valid age is required." };
  }
  try {
    const response = await api.post("/api/v1/users/", {
      email,
      age: input.age,
      password: input.password,
      roles: ["ADMIN"],
      is_active: true,
    });
    revalidatePath("/admin/users");
    return {
      success: true,
      message: response.data?.message || "Admin account created.",
    };
  } catch (error) {
    const message = extractApiMessage(error, "Failed to create the admin.");
    logger.error(`createAdmin("${email}") failed: ` + error);
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
