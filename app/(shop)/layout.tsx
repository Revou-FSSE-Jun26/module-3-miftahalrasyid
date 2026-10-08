import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    // Pastikan min-h-screen dipasang agar warna latar memenuhi dari atas sampai bawah monitor
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <Header />

        {/* Biarkan main melebar secara fleksibel tanpa membatasi warna latar belakang */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-8">
          {children} {/* Tempat Homepage (page.tsx) Anda dirender */}
        </main>
        <Footer /> {/* 👈 Footer hanya aktif di dalam rute toko */}
      </div>
    </CartProvider>
  );
}