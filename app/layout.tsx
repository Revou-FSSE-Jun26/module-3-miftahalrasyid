import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalEventProvider from "@/context/GlobalEventProvider"
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RovoDevShop",
    template: "%s | RovoDevShop",
  },
  description:
    "RovoDevShop — a trusted marketplace where sellers and buyers meet. Browse products, categories, and manage your orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalEventProvider>
          {children}
        </GlobalEventProvider>
        {/* Global toast host — success messages for CRUD across shop + dashboards. */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            // Keep transitions functional and fast.
            duration: 3000,
            success: { duration: 2500 },
          }}
        />
      </body>
    </html>
  );
}
