import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 💡 Mendesain kontainer halaman penuh (min-h-screen) 
    // agar form login otomatis berada di tengah layar (flex items-center justify-center)
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-black p-4 transition-colors">
      
      {/* Tempat file page.tsx (Formulir Login Anda) akan disisipkan dan dirender */}
      <main className="w-full flex justify-center items-center">
        {children}
      </main>
      
    </div>
  );
}