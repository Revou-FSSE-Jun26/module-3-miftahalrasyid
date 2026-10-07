"use client"
import { SellerProduct } from '@/app/actions/catalog.actions';
import { formatRupiah, formatTitle } from '@/utils/format';

export function ProductCard({ product }: ProductCardProps) {
    const inStock = product.stock > 0;
    const title = formatTitle(product.title || product.name);
    const brand = product.brand || "";
    const imageUrl = product.images?.[0];
    const detailUrl = `/products/${product.id}`;
    const stockStatus = product.stock > 10 ? "In stock" : product.stock > 0 ? "Low stock" : "Sold out";

    return (
        <a href={detailUrl} className="block group">
            <article className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 h-full flex flex-col">
                {/* Stock indicator - subtle corner */}
                <div className={`absolute top-3 right-3 z-10 ${inStock ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'} px-2 py-1 rounded-full text-xs font-medium`}>
                    {stockStatus}
                </div>

                {/* Image container with aspect ratio */}
                <div className="aspect-[4/3] bg-gray-100 dark:bg-[#0a0a0a] overflow-hidden relative">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                            <div className="text-center">
                                <div className="text-3xl mb-1">📷</div>
                                <p className="text-xs">No image</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content area */}
                <div className="p-5 flex-1 flex flex-col">
                    {/* Title and brand */}
                    <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-[#2563eb] dark:group-hover:text-[#3b82f6] transition-colors">
                            {title}
                        </h3>
                        {brand && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {brand}
                            </p>
                        )}
                    </div>

                    {/* Price - primary focus */}
                    <div className="mt-auto">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                            {formatRupiah(product.price)}
                        </div>

                        {/* Secondary info row */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                            <div className="flex items-center gap-1">
                                <span>Stock:</span>
                                <span className={`font-medium ${product.stock > 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {product.stock}
                                </span>
                            </div>
                            {product.model && (
                                <div className="truncate max-w-[120px]">
                                    {product.model}
                                </div>
                            )}
                        </div>

                        {/* Action button - visible on hover/always */}
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-full text-center py-2.5 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 rounded-lg text-sm font-medium hover:bg-[#2563eb] dark:hover:bg-[#3b82f6] transition-colors cursor-pointer">
                                View details
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </a>
    );
}

export interface ProductCardProps {
    product: SellerProduct;
}