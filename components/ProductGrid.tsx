import { SellerProduct } from "@/app/actions/catalog.actions";
import { ProductCard } from "@/components/ProductCard"

interface ProductGridProps {
    catalogues: SellerProduct[]
}

// Featured product detection - first product gets featured styling
function isFeaturedProduct(index: number, catalogues: SellerProduct[]) {
    return index === 0 && catalogues.length > 3;
}

export function ProductGrid({ catalogues }: ProductGridProps) {
    if (catalogues.length === 0) {
        return (
            <div className="col-span-full py-16 text-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
        );
    }

    return (
        <div id="grid" className="lg:col-span-3">
            {/* Asymmetric grid - featured first item spans full width */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {catalogues.map((product: SellerProduct, index: number) => (
                    <div
                        key={product.id}
                        className={isFeaturedProduct(index, catalogues) ? "md:col-span-2 lg:col-span-3" : ""}
                    >
                        {isFeaturedProduct(index, catalogues) ? (
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-[#1a1a1a] dark:to-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                                <div className="md:flex">
                                    <div className="md:w-1/2 aspect-[4/3]">
                                        <img
                                            src={product.images?.[0] || ""}
                                            alt={product.title || product.name || "Product"}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="md:w-1/2 p-8">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium mb-4">
                                            Featured
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {product.title || product.name}
                                        </h3>
                                        {product.brand && (
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">{product.brand}</p>
                                        )}
                                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                                            {formatRupiah(product.price)}
                                        </div>
                                        <a
                                            href={`/products/${product.id}`}
                                            className="inline-flex items-center px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg font-semibold transition-colors"
                                        >
                                            View details
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ProductCard product={product} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatRupiah(amount: number) {
    return `Rp ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}