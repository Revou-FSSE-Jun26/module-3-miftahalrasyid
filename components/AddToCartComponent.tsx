"use client"
import React from 'react'
import QtyStepper from '@/components/QtyStepper';
import AddToCartButton from '@/components/AddToCartButton';
import { SellerProductDetail } from '@/app/actions/catalog.actions';
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
    inStock: boolean;
    product: SellerProductDetail;
    /**
     * "full" (default) = large full-width button for the main action area.
     * "compact" = smaller inline button for the sticky mobile bar.
     */
    variant?: "full" | "compact";
}

function AddToCartComponent({
    product,
    inStock,
    variant = "full",
}: AddToCartButtonProps) {
    const [quantity, setQuantity] = React.useState(product.stock > 0 ? 1 : 0);
    const { addItem } = useCart();
    const [status, setStatus] = React.useState<"idle" | "adding" | "added" | "error">("idle");
    const [message, setMessage] = React.useState<string | null>(null);

    const handleAdd = async () => {
        setStatus("adding");
        setMessage(null);
        const res = await addItem(product.id, quantity);
        if (res.success) {
            setStatus("added");
            setTimeout(() => setStatus("idle"), 1500);
        } else {
            setStatus("error");
            // Surface the backend's actual reason (e.g. "You cannot add your own
            // listing to the cart", "Insufficient stock") instead of a generic guess.
            setMessage(res.message || "Couldn't add to cart.");
            setTimeout(() => setStatus("idle"), 3500);
        }
    };
    return (
        <div className="flex flex-row sm:flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <QtyStepper useItemsQty={[quantity, setQuantity]} stock={product.stock} />
            <AddToCartButton
                sellerProductId={product.id}
                inStock={inStock}
                handleAdd={handleAdd}
                status={status}
                message={message}
            />
        </div>
    )
}

export default AddToCartComponent