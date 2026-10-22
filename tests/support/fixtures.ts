/**
 * Shared mock fixtures for the Playwright E2E suite. Shapes mirror the Flask
 * backend response envelopes ({ success, message, data, pagination }) so the
 * mocked app behaves like the real one — without any backend call.
 */

export const CREDS = {
  superadmin: {
    email: "funny.clown.1112@gmail.com",
    password: "Password1234",
    roles: ["SUPERADMIN"],
  },
  admin: {
    email: "mike@gmail.com",
    password: "Password1234",
    roles: ["BUYER", "ADMIN"],
  },
  seller: {
    email: "justin@gmail.com",
    password: "Password1234",
    roles: ["BUYER", "SELLER"],
  },
  buyer: {
    email: "budi@gmail.com",
    password: "Password1234",
    roles: ["BUYER"],
  },
} as const;

export type RoleKey = keyof typeof CREDS;

/**
 * Build an UNSIGNED JWT (header.payload.signature) whose payload carries the
 * claims the app's getSession()/jwtDecode read: sub, email, roles. The signature
 * segment is a dummy — jwtDecode does not verify it.
 */
export function fakeJwt(claims: {
  sub: string;
  email: string;
  roles: string[];
  expSeconds?: number;
}): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: claims.sub,
    email: claims.email,
    roles: claims.roles,
    iat: now,
    exp: now + (claims.expSeconds ?? 60 * 60), // 1h
  };
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return `${b64(header)}.${b64(payload)}.testsignature`;
}

export function tokensFor(role: RoleKey, userId = roleUserId(role)) {
  const { email, roles } = CREDS[role];
  return {
    access_token: fakeJwt({ sub: String(userId), email, roles: [...roles] }),
    refresh_token: fakeJwt({
      sub: String(userId),
      email,
      roles: [...roles],
      expSeconds: 7 * 24 * 3600,
    }),
  };
}

export function roleUserId(role: RoleKey): number {
  return { superadmin: 1, admin: 2, seller: 3, buyer: 8 }[role];
}

// --- Products (seller-products browse + detail) --------------------------------
export const mockProducts = [
  {
    id: 1,
    product_id: 1,
    seller_id: 3,
    title: "Laptop",
    slug: "laptop",
    price: 5000000,
    stock: 20,
    status: "ACTIVE",
    images: [""],
    brand: "Acme",
    name: "laptop",
    created_at: "2026-01-01T00:00:00+07:00",
  },
  {
    id: 2,
    product_id: 2,
    seller_id: 3,
    title: "Mouse",
    slug: "mouse",
    price: 35000,
    stock: 20,
    status: "ACTIVE",
    images: [""],
    brand: "Acme",
    name: "mouse",
    created_at: "2026-01-02T00:00:00+07:00",
  },
];

export function listEnvelope<T>(data: T[], page = 1, perPage = 10) {
  return {
    success: true,
    message: "ok",
    data,
    pagination: { page, per_page: perPage, total: data.length },
  };
}

export function itemEnvelope<T>(data: T) {
  return { success: true, message: "ok", data };
}

// --- Categories ----------------------------------------------------------------
export const mockCategories = [
  { id: 1, name: "electronics", created_at: "2026-01-01T00:00:00+07:00" },
  { id: 2, name: "fashion", created_at: "2026-01-01T00:00:00+07:00" },
];

// --- Addresses -----------------------------------------------------------------
export const mockDefaultAddress = {
  id: 10,
  label: "Home",
  recipient_name: "Budi Hartono",
  phone: "+6281234567801",
  address_line: "Jl. Sudirman No. 15",
  city: "Jakarta Selatan",
  province: "DKI Jakarta",
  postal_code: "12190",
  is_default: true,
  created_at: "2026-01-01T00:00:00+07:00",
};

// --- Cart ----------------------------------------------------------------------
// Shape must match CartLine in app/actions/cart.actions.ts.
export function mockCartLine(product = mockProducts[1], qty = 1) {
  return {
    id: 100,
    seller_product_id: product.id,
    product_id: product.product_id,
    title: product.title,
    price: product.price,
    quantity: qty,
    line_total: product.price * qty,
    stock: product.stock,
    available: true,
    images: product.images,
    created_at: "2026-01-03T00:00:00+07:00",
    updated_at: "2026-01-03T00:00:00+07:00",
  };
}

export function cartEnvelope(lines: Array<Record<string, unknown>>) {
  const subtotal = lines.reduce(
    (n, l) => n + (Number(l.price) || 0) * (Number(l.quantity) || 0),
    0,
  );
  return {
    success: true,
    data: lines,
    summary: {
      item_count: lines.length,
      subtotal,
      has_unavailable: false,
    },
  };
}

// --- Orders --------------------------------------------------------------------
export const mockPendingOrder = {
  id: 500,
  name: "cart order test",
  status: "PENDING",
  subtotal: 35000,
  tax_amount: 3850,
  tax_percent: 11,
  total: 38850,
  created_at: "2026-01-03T00:00:00+07:00",
  items: [
    {
      id: 900,
      seller_product_id: 2,
      product_id: 2,
      product_name: "mouse",
      quantity: 1,
      compound_price: 35000,
    },
  ],
};

// --- Payment (Midtrans Snap) ---------------------------------------------------
export const mockSnap = {
  snap_token: "test-snap-token",
  // Stub URL — the test intercepts navigation here; no real Midtrans load.
  redirect_url:
    "https://app.sandbox.midtrans.test/snap/v2/vtweb/test-snap-token",
};
