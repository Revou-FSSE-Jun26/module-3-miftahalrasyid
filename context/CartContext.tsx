"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addToCart as addToCartAction,
  clearCart as clearCartAction,
  getCart as getCartAction,
  removeCartItem as removeCartItemAction,
  updateCartItem as updateCartItemAction,
  type CartLine,
} from "@/app/actions/cart.actions";

export interface CartItem {
  /** Server cart-line id (cart_items.id) — needed for update/remove. */
  id: number;
  sellerProductId: number;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  /** Live stock + availability from the backend (listing active + enough stock). */
  stock: number;
  available: boolean;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  /** Set after a failed mutation; cleared on the next successful one. */
  error: string | null;
  /** True while the FIRST load is in flight (for skeletons). */
  initializing: boolean;
  addItem: (
    sellerProductId: number,
    qty?: number,
  ) => Promise<{ success: boolean; message: string }>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQty: (cartItemId: number, qty: number) => Promise<void>;
  clear: (options?: { localOnly?: boolean }) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Map a backend cart line to the client CartItem shape the UI expects. */
function toItem(line: CartLine): CartItem {
  return {
    id: line.id,
    sellerProductId: line.seller_product_id,
    title: line.title ?? "",
    price: line.price,
    image: line.images?.[0],
    quantity: line.quantity,
    stock: line.stock,
    available: line.available,
  };
}

/**
 * Account-synced cart backed by the Flask `cart_items` table. All reads/writes
 * go through server actions (the Bearer token is attached server-side). State
 * here is a cache of the server cart; every mutation re-syncs from the server
 * response so quantities reflect server-side stock caps.
 */
export function CartProvider({ children, isAuthenticated }: { children: React.ReactNode, isAuthenticated: boolean }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard so a slow mutation can't overwrite a newer refresh.
  const inflight = useRef(0);

  const applyCart = useCallback((lines: CartLine[]) => {
    setItems(lines.map(toItem));
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    const ticket = ++inflight.current;
    const res = await getCartAction();
    if (ticket === inflight.current) applyCart(res.items);
  }, [applyCart]);

  // Initial load. If the user isn't logged in the action returns an empty cart,
  // so this is safe to call unconditionally.
  useEffect(() => {
    (async () => {
      await refresh();
      setInitializing(false);
    })();
  }, [refresh]);

  const addItem = useCallback(
    async (
      sellerProductId: number,
      qty = 1,
    ): Promise<{ success: boolean; message: string }> => {
      setLoading(true);
      setError(null);
      const res = await addToCartAction(sellerProductId, qty);
      if (res.success) {
        await refresh();
      } else {
        setError(res.message);
      }
      setLoading(false);
      return res;
    },
    [refresh],
  );
  const removeItemImpl = useCallback(
    async (cartItemId: number) => {
      setLoading(true);
      setError(null);
      const res = await removeCartItemAction(cartItemId);
      if (!res.success) setError(res.message);
      await refresh();
      setLoading(false);
    },
    [refresh],
  );
  const updateQty = useCallback(
    async (cartItemId: number, qty: number) => {
      // Qty 0 or less => remove the line (matches the stepper's old behavior).
      if (qty <= 0) {
        await removeItemImpl(cartItemId);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await updateCartItemAction(cartItemId, qty);
      if (res.success) {
        await refresh();
      } else {
        setError(res.message);
        await refresh(); // re-sync to the real server quantity
      }
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh],
  );



  const removeItem = removeItemImpl;

  const clear = useCallback(async (options?: { localOnly?: boolean }) => {
    setLoading(true);
    setError(null);

    // clear cart when log out.   
    if (options?.localOnly) {
      setItems([]); // Wipes the items array, which instantly drops count and total to 0
      setLoading(false);
      return;
    }

    const res = await clearCartAction();
    if (!res.success) setError(res.message);
    await refresh();
    setLoading(false);
  }, [refresh]);

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const total = useMemo(
    () => items.reduce((n, i) => (i.available ? n + i.price * i.quantity : n), 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    count,
    total,
    loading,
    error,
    initializing,
    addItem,
    removeItem,
    updateQty,
    clear,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
