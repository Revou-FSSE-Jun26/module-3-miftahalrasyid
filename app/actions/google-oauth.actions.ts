import axios from "axios";
import { GoogleAuthSchema } from "../schemas/auth.schemas";
import { createSession } from "../lib/sessions";
import { api } from "../lib/api/api";

interface GoogleActionState {
  success: boolean;
  registration_step: "FORM" | "NEED_AGE";
  message: string;
  id_token: string | null;
}

export async function googleSignupAction(
  prevState: GoogleActionState,
  formData: FormData,
): Promise<GoogleActionState> {
  // 1. FormData からオブジェクトに一括変換
  const rawFields = Object.fromEntries(formData.entries());

  // 2. Zod による型安全なチェック
  const validatedFields = GoogleAuthSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      registration_step: prevState.registration_step, // 現在のステップを維持
      message: "Invalid input data. データの形式が正しくありません。",
      id_token: (rawFields.id_token as string) || null,
    };
  }

  // バリデーション済みの安全なデータを取り出す
  const { id_token, age } = validatedFields.data;

  try {
    // 3. Flask バックエンドにデータを送信
    // age がない（undefined）の場合は、バックエンドが要求する通りに dict に含めないか null で送信
    const response = await api.post("/api/v1/auth/oauth/google", {
      id_token,
      age: age ?? null,
    });

    const responseData = response.data;

    // 💡 4. 【重要】バックエンドから NEED_AGE が返ってきた場合の処理
    if (responseData?.registration_step === "NEED_AGE") {
      return {
        success: false,
        registration_step: "NEED_AGE", // ⬅️ これによりフロント側で条件付きレンダリングが発動
        message: responseData.message || "Age is required.",
        id_token: id_token, // ⬅️ 次の年齢送信フォームに引き継ぐためにトークンを保存！
      };
    }

    // 5. 【通常ルート】ログイン成功時の処理
    // ご提示いただいた response.data の構造を安全に展開します
    const { access_token, refresh_token, message } = responseData;

    if (access_token && refresh_token) {
      await createSession(access_token, refresh_token);
      return {
        success: true,
        registration_step: "FORM",
        message: message || "Login successful!",
        id_token: null,
      };
    }

    return {
      success: false,
      registration_step: "FORM",
      message: "Failed to obtain tokens from backend.",
      id_token: id_token,
    };
  } catch (error: unknown) {
    // 6. エラーハンドリング（ご提示いただいたロジックを綺麗に整理）
    if (axios.isAxiosError(error)) {
      const flaskMessage =
        error.response?.data?.message || "Flask server error occurred.";
      return {
        success: false,
        registration_step: prevState.registration_step,
        message: flaskMessage,
        id_token: id_token, // エラーが起きてもユーザーが打ったトークンを保持
      };
    }

    const standardMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      registration_step: prevState.registration_step,
      message: standardMessage,
      id_token: id_token,
    };
  }
}
