"use server";

import { api } from "@/app/lib/api/api";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";
import axios from "axios";

/**
 * User address data layer. Addresses belong to the authenticated user and are
 * managed under /api/v1/users/me/addresses (list/create). Auth goes through the
 * axios `api` instance (Bearer token attached server-side).
 */

export interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at?: string;
}

export interface AddressInput {
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default?: boolean;
}

export interface AddressResult {
  success: boolean;
  message: string;
  /** Per-field validation errors from the backend, if any. */
  fieldErrors?: Record<string, string[]>;
}

/** List the authenticated user's addresses. */
export async function getMyAddresses(): Promise<Address[]> {
  try {
    const response = await api.get("/api/v1/users/me/addresses");
    return response.data?.data || [];
  } catch (error) {
    logger.error("Gagal mengambil alamat: " + error);
    return [];
  }
}

/** Shared axios-error → AddressResult mapper (surfaces backend field errors). */
function toAddressError(error: unknown, fallback: string): AddressResult {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    // flask-smorest 422 shape: { errors: { json: { field: [msg] } } }
    const fieldErrors =
      data?.errors?.json ??
      (typeof data?.errors === "object" ? data?.errors : undefined);
    return {
      success: false,
      message: data?.message || fallback,
      fieldErrors,
    };
  }
  logger.error(fallback + ": " + error);
  return { success: false, message: fallback };
}

/** Create a new address for the authenticated user. */
export async function createAddress(
  input: AddressInput,
): Promise<AddressResult> {
  try {
    const response = await api.post("/api/v1/users/me/addresses", input);
    revalidatePath("/my-account");
    return {
      success: true,
      message: response.data?.message || "Address added.",
    };
  } catch (error) {
    return toAddressError(error, "Failed to add address.");
  }
}

/** Update an existing address. Pass only the fields being changed. */
export async function updateAddress(
  id: number,
  input: Partial<AddressInput>,
): Promise<AddressResult> {
  try {
    const response = await api.put(`/api/v1/users/me/addresses/${id}`, input);
    revalidatePath("/my-account");
    return {
      success: true,
      message: response.data?.message || "Address updated.",
    };
  } catch (error) {
    return toAddressError(error, "Failed to update address.");
  }
}

/** Mark an address as the default (unsets the previous default server-side). */
export async function setDefaultAddress(id: number): Promise<AddressResult> {
  return updateAddress(id, { is_default: true });
}

/** Delete an address. */
export async function deleteAddress(id: number): Promise<AddressResult> {
  try {
    const response = await api.delete(`/api/v1/users/me/addresses/${id}`);
    revalidatePath("/my-account");
    return {
      success: true,
      message: response.data?.message || "Address deleted.",
    };
  } catch (error) {
    return toAddressError(error, "Failed to delete address.");
  }
}
