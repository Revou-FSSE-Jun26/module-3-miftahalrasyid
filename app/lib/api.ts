import axios from "axios";
import { refreshSession } from "./sessions";

// Get the Flask API URL from environment variables, fallback to local Flask port
const FLASK_API_URL =
  process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: FLASK_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response, // Jika request sukses, teruskan saja
  async (error) => {
    const originalRequest = error.config;

    // Jika Flask mengembalikan 401 dan request ini belum pernah dicoba ulang
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 1. Panggil utility refresh session untuk meminta token baru ke Flask
        // Fungsi ini dijalankan di server-side lewat mekanisme Next.js jika dipanggil dari server action
        const newAccessToken = await refreshSession();

        // 2. Pasang access token yang baru ke request yang sempat gagal tadi
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // 3. Tembak ulang request yang gagal tadi dengan token baru
        return api(originalRequest);
      } catch (refreshError) {
        // Jika refresh token juga gagal/expired, bersihkan session dan tendang ke login
        if (typeof window !== "undefined") {
          // 1. Ambil URL path terakhir yang sedang dibuka user saat ini
          const currentPath = window.location.pathname + window.location.search;

          // 2. Kirim user ke halaman login sambil membawa parameter 'next' secara dinamis
          window.location.href = `/auth/login?next=${encodeURIComponent(currentPath)}&message=session_expired`;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
