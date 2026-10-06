"use server";
import {
  SignupFormSchema,
  LoginFormSchema,
  type FormState,
  type LoginFormState,
} from "@/app/schemas/auth.schemas";
import { api } from "@/app/lib/api";
import axios from "axios";
import { createSession, deleteSession } from "../lib/sessions";
import { redirect } from "next/navigation";

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
  redirect("/");
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

  try {
    const response = await api.post("/api/v1/auth/login", validatedFields.data);
    // const flaskCookies = response.headers["set-cookie"];

    const { access_token, refresh_token } = response.data;

    await createSession(access_token, refresh_token);
    return {
      success: true,
      message: response.data?.message || "Login successful!",
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const flaskMessage =
        error.response?.data?.message || "Flask server error occurred.";
      return {
        success: false,
        message: flaskMessage,
      };
    }
    const standardMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message: standardMessage,
    };
  }
}
