"use server"
import { getCatalogues } from "@/app/actions/catalog.actions";
import { ProductGrid } from "@/components/ProductGrid"
import { logger } from "@/utils/logger";
import SearchBar from "@/components/SearchBar";




async function page({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const queryKeyword = resolvedParams.q;
    const products = await getCatalogues(queryKeyword);
    logger.debug(
        { data: products },
        "Berhasil mengambil data produk seller",
    );
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="p-8">
                <h1 className="text-2xl font-bold text-gray-800 text-center pb-4">Lets Start Shopping</h1>
                <SearchBar />
                <ProductGrid catalogues={products} />
            </main>
        </div>
    );
}
interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default page;