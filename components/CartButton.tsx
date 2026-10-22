"use client";

import Link from "next/link";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { useCart } from "@/context/CartContext";

/**
 * Cart icon button with a live item-count badge. Reads `count` from CartContext,
 * so it updates automatically whenever an item is added/removed. The badge is
 * hidden at zero (MUI `showZero` defaults to false).
 */
export function CartButton() {
  const { items } = useCart();
  // Distinct products in the cart (number of cart lines), not total quantity.
  const productCount = items.length;

  return (
    <IconButton
      component={Link}
      href="/cart"
      data-testid="cart-button"
      aria-label={`Cart${productCount ? `, ${productCount} product${productCount > 1 ? "s" : ""}` : ""}`}
      size="large"
      sx={{ color: "rgb(75 85 99)" }} // gray-600
    >
      <Badge badgeContent={productCount} color="primary" max={99}>
        <ShoppingCartRoundedIcon />
      </Badge>
    </IconButton>
  );
}
