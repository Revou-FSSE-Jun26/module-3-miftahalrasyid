"use client"
import React from 'react'


interface QtyCounterProps {
    useItemsQty: [number, React.Dispatch<React.SetStateAction<number>>]
    onQuantityDown?: () => void
    onQuantityUp?: () => void
    stock: number
}

function QtyCounter({ onQuantityDown, onQuantityUp, stock, useItemsQty }: QtyCounterProps) {
    const [count, setCount] = useItemsQty;
    const clamp = (count: number) => Math.max(1, Math.min(stock, count));
    const handleQuantityDown = () => {

        setCount(prev => clamp(prev - 1))
    }
    const handleQuantityUp = () => {

        setCount(prev => clamp(prev + 1))
    }
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleQuantityDown}
                disabled={count === 0 || count === 1}
                className="py-3 px-5 rounded-xl font-semibold text-lg  border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:not-disabled:bg-gray-50 dark:hover:not-disabled:bg-gray-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Decrease quantity"
            >
                −
            </button>
            <span className={`w-7 text-md text-center  ${stock === 0 ? "text-gray-400" : "text-gray-600"}`}>{count}</span>
            <button
                onClick={handleQuantityUp}
                disabled={count === stock}
                title={count >= stock ? "Reached available stock" : undefined}
                className="py-3 px-5 rounded-xl font-semibold text-lg  border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:not-disabled:bg-gray-50 dark:hover:not-disabled:bg-gray-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    )
}

export default QtyCounter