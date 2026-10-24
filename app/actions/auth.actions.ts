"use server";
import {
  SignupFormSchema,
  LoginFormSchema,
  type FormState,
  type LoginFormState,
  GoogleAuthSchema,
} from "@/app/schemas/auth.schemas";
import { api } from "@/app/lib/api/api";
import axios from "axios";
import { createSession, deleteSession } from "../lib/sessions";
import { redirect } from "next/navigation";
import { logger } from "@/utils/logger";

export async function signup(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  // 1. Convert native FormData directly into a plain JavaScript Object
  const rawFields = Object.fromEntries(formData.entries());
  // 2. Run your Zod validation rules
  const validatedFields = SignupFormSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }
  const { confirm_password, terms, ...backendData } = validatedFields.data;
  // 3. Send data as pure JSON to your Flask backend
  try {
    await api.post("/api/v1/auth/register", backendData);
    return { success: true, message: "Signup successful!" };
  } catch (error: unknown) {
    // 2. Safely verify if the error came from Axios
    if (axios.isAxiosError(error)) {
      const flaskMessage =
        error.response?.data?.message || "Flask server error occurred.";
      return {
        success: false,
        message: flaskMessage,
      };
    }

    // 3. Fallback for generic JavaScript errors
    const standardMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message: standardMessage,
    };
  }
}

export async function logout() {
  await deleteSession();
  // redirect("/");
  return { success: true };
}

export async function login(
  redirectTo: string | undefined,
  state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const rawFields = Object.fromEntries(formData.entries());
  const validatedFields = LoginFormSchema.safeParse(rawFields);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }

  // try {
  const response = await api.post("/api/v1/auth/login", validatedFields.data);
  // const flaskCookies = response.headers["set-cookie"];

  const { access_token, refresh_token } = response.data;
  console.log("access_token", access_token, "message", response.data.message);
  await createSession(access_token, refresh_token);

  return {
    success: true,
    message: response.data?.message || "Login successful!",
  };
  // } catch (error: unknown) {
  //   if (axios.isAxiosError(error)) {
  //     const flaskMessage =
  //       error.response?.data?.message || "Flask server error occurred.";
  //     return {
  //       success: false,
  //       message: flaskMessage,
  //     };
  //   }
  //   const standardMessage =
  //     error instanceof Error ? error.message : "An unexpected error occurred.";
  //   return {
  //     success: false,
  //     message: standardMessage,
  //   };
  // }
  // return new Promise((resolve => {

  //   setTimeout(() => {
  //     resolve({
  //       success: false,
  //       message: "Invalid email or password.",
  //     });
  //   }, 3000);
  // }))
}

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
      message: "Invalid input data. ",
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
    if (responseData && typeof responseData === "object") {
      logger.info(
        "registration_step received: " + JSON.stringify(responseData),
      );
    }
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
