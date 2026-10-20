"use server";

import { api } from "@/app/lib/api/api";
import { logger } from "@/utils/logger";
import axios from "axios";

/**
 * Payment data layer. Initiates a Midtrans Snap payment for a PENDING order via
 * POST /api/v1/payment/. When address_id is omitted the backend uses the user's
 * default address (and errors if there is none). Returns the Snap redirect URL
 * the client should navigate to.
 */

export interface InitiatePaymentResult {
  success: boolean;
  message: string;
  redirectUrl?: string;
  snapToken?: string;
}

export async function initiatePayment(
  orderId: number,
  addressId?: number,
): Promise<InitiatePaymentResult> {
  try {
    const response = await api.post("/api/v1/payment/", {
      order_id: orderId,
      ...(addressId ? { address_id: addressId } : {}),
    });
    return {
      success: true,
      message: response.data?.message || "Payment initiated.",
      redirectUrl: response.data?.redirect_url,
      snapToken: response.data?.snap_token,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to initiate payment.",
      };
    }
    logger.error(`initiatePayment(#${orderId}) failed: ` + error);
    return { success: false, message: "Failed to initiate payment." };
  }
}
