import { getCatalogueById } from "@/app/actions/catalog.actions";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatRupiah, formatTitle } from "@/utils/format";
import { ArrowBack, Inventory, LocalShipping, Shield } from "@mui/icons-material";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

/**
 * Dynamic page metadata: fetch the product and use its real name as the title.
 * Falls back to a generic title if the product can't be loaded.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const product = await getCatalogueById(id);
    if (!product) {
        return {
            title: "Product not found — RovoDevShop",
            description: "The product you are looking for could not be found.",
        };
    }

    const name = formatTitle(product.title || product.name);
    const brand = product.brand ? `${product.brand} · ` : "";
    return {
        title: `${name} — RovoDevShop`,
        description:
            product.description ||
            `${brand}${name} available on RovoDevShop. ${formatRupiah(product.price)}.`,
    };
}

// Skeleton loader for SSR
function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] animate-pulse">
            <header className="sticky top-0 z-10 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </header>
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/2">
                        <div className="aspect-square bg-gray-300 dark:bg-gray-800 rounded-2xl"></div>
                    </div>
                    <div className="lg:w-1/2 space-y-6">
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function getStockStatus(stock: number) {
    if (stock > 10) return { text: "In stock", color: "text-emerald-600 dark:text-emerald-400" };
    if (stock > 0) return { text: "Low stock", color: "text-amber-600 dark:text-amber-400" };
    return { text: "Out of stock", color: "text-rose-600 dark:text-rose-400" };
}

async function ProductDetailContent({ id }: { id: string }) {
    const product = await getCatalogueById(id);

    if (!product) {
        notFound();
    }

    const inStock = product.stock > 0;
    const title = formatTitle(product.title || product.name);
    const brand = product.brand || "Unknown brand";
    const mainImage = product.images?.[0];
    const stockStatus = getStockStatus(product.stock);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
            {/* Sticky minimalist header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/products"
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[#2563eb] dark:hover:text-[#3b82f6] transition-colors"
                    >
                        <ArrowBack fontSize="small" />
                        Back to products
                    </Link>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Product #{product.id}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left column - Visual & core info */}
                    <div className="space-y-8">
                        {/* Image container */}
                        <div className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={title}
                                    className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">📷</div>
                                        <p className="text-sm">No image available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image thumbnails (progressive disclosure) */}
                        {product.images && product.images.length > 1 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Gallery ({product.images.length} images)
                                </h3>
                                <div className="flex gap-2 overflow-x-auto pb-4">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-transparent hover:border-[#2563eb] dark:hover:border-[#3b82f6] overflow-hidden transition-all"
                                            aria-label={`View image ${idx + 1}`}
                                        >
                                            <img
                                                src={img}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trust signals */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
                                <LocalShipping className="text-gray-500 dark:text-gray-400" fontSize="small" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Free shipping</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Over Rp 500.000</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg">
                                <Shield className="text-gray-500 dark:text-gray-400" fontSize="small" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Secure payment</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">100% protected</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Product info (asymmetric layout) */}
                    <div className="space-y-8">
                        {/* Status and brand */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                {stockStatus.text}
                            </div>
                            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                                {title}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                                {brand}
                            </p>
                            {product.categories && product.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {product.categories.map((category) => (
                                        <span
                                            key={category}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm capitalize"
                                        >
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price section */}
                        <div className="pt-2">
                            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                                {formatRupiah(product.price)}
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <Inventory fontSize="small" className="inline mr-1" />
                                    {product.stock} units remaining
                                </div>
                                <div className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                                    {product.status}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons (divergent layout) */}
                        <div className="pt-4 space-y-4">
                            <AddToCartButton
                                sellerProductId={product.id}
                                inStock={inStock}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <button className="py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Save for later
                                </button>
                                <button className="py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Compare
                                </button>
                            </div>
                        </div>

                        {/* Product details (progressive disclosure via border separation) */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Product specifications
                            </h2>
                            <div className="space-y-4">
                                {product.model && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">Model</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{product.model}</span>
                                    </div>
                                )}
                                {product.color && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">Color</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{product.color}</span>
                                    </div>
                                )}
                                {product.size && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">Size</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{product.size}</span>
                                    </div>
                                )}
                                {product.seller_name && (
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-gray-600 dark:text-gray-400">Sold by</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{product.seller_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description (clean typography) */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                About this product
                            </h2>
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {product.description || `This ${formatTitle(product.name, "product")} from ${brand} is available for purchase with secure checkout and fast delivery.`}
                                </p>
                            </div>
                        </div>

                        {/* Metadata (subtle footer) */}
                        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Listed on {new Date(product.created_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile action bar (progressive disclosure - only on mobile) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800 p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatRupiah(product.price)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{stockStatus.text}</div>
                    </div>
                    <button
                        disabled={!inStock}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${inStock
                            ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            }`}
                    >
                        {inStock ? "Add to cart" : "Sold out"}
                    </button>
                </div>
            </div>
        </div>
    );
}

async function page({ params }: PageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDetailContent id={id} />
        </Suspense>
    );
}

export default page;