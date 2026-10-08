import { getCatalogues } from "@/app/actions/catalog.actions";
import { ProductGrid } from "@/components/ProductGrid"
import { logger } from "@/utils/logger";
import SearchBar from "@/components/SearchBar";




export const metadata = {
    title: "Products — RovoDevShop",
    description: "Browse and search all available products on RovoDevShop.",
};

async function page({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const queryKeyword = resolvedParams.search;
    // ?category=<name>  → category_name (text, partial match)
    // ?category_id=<id> → category_id (integer, exact)
    const rawId = resolvedParams.category_id;
    const categoryId = rawId ? Number(rawId) : undefined;
    const products = await getCatalogues({
        search: queryKeyword,
        category_name: resolvedParams.category,
        category_id: categoryId && !Number.isNaN(categoryId) ? categoryId : undefined,
    });
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
    searchParams: Promise<{ search?: string; category?: string; category_id?: string }>;
}

export default page;