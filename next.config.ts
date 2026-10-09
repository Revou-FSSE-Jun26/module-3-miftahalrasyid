import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    const backendUrl =
      process.env.FLASK_API_INTERNAL_URL || "http://127.0.0.1:8000";

    return [
      {
        // Menangkap APAPUN setelah /backend-images/ secara mendalam
        source: "/backend-images/:path*",
        // Diteruskan LANGSUNG ke /uploads/ di Flask (KATA "/static/" TELAH DIHAPUS)
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
