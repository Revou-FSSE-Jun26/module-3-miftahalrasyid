import {ProductCard,Product} from "@/components/ProductCard"

const products: Product[] = [
    { id: 1, name: "Wireless Mouse", price: 250000, category: "Accessories", inStock: true },
    { id: 2, name: "Mechanical Keyboard", price: 500000, category: "Accessories", inStock: false },
    { id: 3, name: "Laptop Pro 14", price: 15000000, category: "Computers", inStock: true },
    { id: 4, name: "USB-C Hub", price: 150000, category: "Accessories", inStock: true },
    { id: 5, name: "Monitor", price: 2500000, category: "Accessories", inStock: true },
    { id: 6, name: "Webcam", price: 200000, category: "Accessories", inStock: true },
    // TODO: add 3+ more products (USB-C Hub, Monitor, Webcam, ...)
];
export function ProductGrid(){
    return (
        <div id="grid" className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product:Product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}