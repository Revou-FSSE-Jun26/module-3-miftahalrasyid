"use server";

import { api } from "@/app/lib/api/api";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import axios from "axios";

/**
 * Authenticated user profile data layer. Reads the caller's own profile via
 * GET /api/v1/users/me (Bearer token attached by the axios `api` instance).
 */

export interface UserProfile {
  age: number;
  email: string;
  is_active: boolean;
  profile: {
    avatar_url: string | null;
    bio: string;
    phone: string;
    updated_at: string | null;
  };
  username: string;
}

export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await api.get("/api/v1/users/me");
    return response.data?.data;
  } catch (error) {
    logger.error("Gagal mengambil profil: " + error);
    throw error;
  }
}

/** Fields the profile endpoint accepts (phone must be +62…). */
export interface ProfileUpdateInput {
  bio?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
}

export interface ProfileUpdateResult {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

/** Update the authenticated user's profile via PUT /api/v1/users/me/profile. */
export async function updateProfile(
  input: ProfileUpdateInput,
): Promise<ProfileUpdateResult> {
  try {
    const response = await api.put("/api/v1/users/me/profile", input);
    revalidatePath("/my-account");
    return {
      success: true,
      message: response.data?.message || "Profile updated.",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      const fieldErrors =
        data?.errors?.json ??
        (typeof data?.errors === "object" ? data?.errors : undefined);
      return {
        success: false,
        message: data?.message || "Failed to update profile.",
        fieldErrors,
      };
    }
    logger.error("updateProfile failed: " + error);
    return { success: false, message: "Failed to update profile." };
  }
}
