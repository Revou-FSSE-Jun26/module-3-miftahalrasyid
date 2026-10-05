
"use client"
import { logger } from '@/utils/logger';
import { Chip } from '@mui/material';
export interface Product {
    id: number,
    name: string,
    price: number,
    category: string,
    inStock: boolean
}
export interface ProductCardProps{
    product: Product
}
type BadgeVariant = "success" | "warning" | "error";
function getBadgeClasses(variant: BadgeVariant) {
    const base = "!h-auto !py-1 !px-2.5 !text-xs !font-semibold !rounded-full [&_span]:!px-1";
    const variants: Record<BadgeVariant, string> = {
        // TODO: success -> green, warning -> yellow, error -> red
        success: "[&.MuiChip-root]:!bg-green-100 [&.MuiChip-root]:!text-green-500",
        warning: "bg-yellow-100 text-yellow-500",
        error: "[&.MuiChip-root]:!bg-red-100 [&.MuiChip-root]:!text-red-500",
    };
    // logger.debug(base + " " + variants[variant])
    return base + " " + variants[variant];
}

function getCardClasses(inStock: boolean) {
    const base = "bg-white rounded-xl shadow-md p-4 transition";
    // TODO: return base + " hover:shadow-xl" when inStock,
    //       otherwise base + " opacity-60 grayscale"
    // logger.debug(inStock ? base + " hover:shadow-xl" : base + " opacity-60 grayscale")
    return inStock ? base + " hover:shadow-xl" : base + " opacity-60 grayscale";
}

function formatRupiah(amount: number) {
    return `Rp ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}


export function ProductCard({product}: ProductCardProps) {
    return (
        <article id={`card-${product.id}`} className={getCardClasses(product.inStock) +"dark:bg-zinc-900"}>
             <div className="bg-gray-800 h-24 flex items-center justify-center rounded mb-3">
                img
            </div>
            {/* Memperbaiki nama fungsi menjadi getBadgeClasses dan menghapus sintaks string template yang salah */}
            <Chip 
                // 1. Tampilkan teks dinamis berdasarkan status stok
                label={product.inStock ? "In Stock" : "Sold Out"} 
                // 2. ID dinamis yang unik untuk elemen DOM
                id={`card-${product.id}-badge`}
                
                // 3. Masukkan hasil fungsi getBadgeClasses langsung ke className
                className={getBadgeClasses(product.inStock ? "success" : "error")}
            />
            
            {/* Menampilkan teks variabel murni menggunakan kurung kurawal {} */}
            <h2 className="text-lg font-bold text-gray-900 mt-2 truncate">{product.name}</h2>
            
            <p className="text-xl font-bold text-blue-600 mt-1">{formatRupiah(product.price)}</p>
            
            <span className="text-xs"></span>
            
            {/* data-id dimasukkan langsung tanpa string template */}
            <button 
                data-id={product.id} 
                className="add-btn bg-blue-600 rounded-md text-white p-4 w-full mt-3 hover:bg-blue-700 transition"
                disabled={!product.inStock} // Opsional: matikan tombol jika stok habis
            >
                {product.inStock ? "Add to cart" : "Out of Stock"}
            </button>
        </article>
    );
}