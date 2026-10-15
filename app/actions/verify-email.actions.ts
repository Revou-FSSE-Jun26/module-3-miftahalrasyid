import "server-only";
import { api } from "@/app/lib/api";
import axios from "axios";
import { logger } from "@/utils/logger";

interface VerificationResult {
  isSuccess: boolean;
  message: string;
}

/**
 * バックエンドのAPIを叩いてメール認証を検証するサーバー専用関数
 */
export async function verifyEmailToken(
  token: string,
): Promise<VerificationResult> {
  try {
    // 1. Axiosインスタンスを使用してGETリクエストを送信
    await api.get(`/api/v1/auth/email_confirmation?token=${token}`);

    // 💡 Axiosはステータスコードが 2xx のときだけここに到達します
    return {
      isSuccess: true,
      message: "Email address verification has been completed.",
    };
  } catch (error) {
    // 2. Axiosに起因するエラー（HTTPエラーまたはネットワークエラー）の判定
    if (axios.isAxiosError(error)) {
      // 💡 サーバーからエラー応答（400や401など）が返ってきた場合（トークンの期限切れなど）
      if (error.response) {
        return {
          isSuccess: false,
          message:
            "Authentication failed. The token has expired or has already been used.",
        };
      }

      // 💡 サーバーへの接続自体が失敗した場合（ネットワークエラー、バックエンドが落ちている等）
      logger.error("verifyEmailToken network failed: " + error.message);
      return {
        isSuccess: false,
        message: "Communication with the server failed.",
      };
    }

    // 3. Axios以外（想定外のJavaScriptエラーなど）のキャッチ
    logger.error("verifyEmailToken unexpected failed: " + error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred.",
    };
  }
}
