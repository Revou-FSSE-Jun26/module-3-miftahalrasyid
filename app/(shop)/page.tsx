"use server"
import { ProductGrid } from "@/components/ProductGrid"




export default async function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="p-8">
        <h1 className="text-2xl text-gray-800">Home</h1>
      </main>
    </div>
  );
}
