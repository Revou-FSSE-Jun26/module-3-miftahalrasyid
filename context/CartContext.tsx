"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  sellerProductId: number;
  title: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (sellerProductId: number) => void;
  updateQty: (sellerProductId: number, qty: number) => void;
  clear: () => void;
}

const STORAGE_KEY = "rovodev_cart";
const CartContext = createContext<CartContextValue | null>(null);

/**
 * Client-only cart stored in localStorage (device-scoped, not account-synced).
 * The cart becomes a real server order only at checkout via POST /orders.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change (after initial hydration, to avoid clobbering).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.sellerProductId === item.sellerProductId,
        );
        if (existing) {
          return prev.map((i) =>
            i.sellerProductId === item.sellerProductId
              ? { ...i, quantity: i.quantity + qty }
              : i,
          );
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    [],
  );

  const removeItem = useCallback((sellerProductId: number) => {
    setItems((prev) => prev.filter((i) => i.sellerProductId !== sellerProductId));
  }, []);

  const updateQty = useCallback((sellerProductId: number, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.sellerProductId !== sellerProductId)
        : prev.map((i) =>
            i.sellerProductId === sellerProductId ? { ...i, quantity: qty } : i,
          ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((n, i) => n + i.quantity, 0),
    [items],
  );
  const total = useMemo(
    () => items.reduce((n, i) => n + i.price * i.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    count,
    total,
    addItem,
    removeItem,
    updateQty,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
