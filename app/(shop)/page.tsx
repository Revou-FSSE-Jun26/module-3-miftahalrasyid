import Image from "next/image";
import {ProductGrid} from "@/components/ProductGrid"




export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="p-8">
        <ProductGrid/>
      </main>
    </div>
  );
}
