# Project Specification — RevoShop Web (Frontend)

> Frontend spec for the **RevoShop** e-commerce marketplace API (Flask + PostgreSQL backend).
> The entire UI is built with **MUI (Material UI)** — every layout, form, table, chart,
> dashboard, dialog, and feedback element uses MUI / MUI X components. No other CSS framework.
> The app **consumes every backend endpoint** — see the coverage matrix in Part B §7.

---

## Part A — Functional

### 1. Project Overview
- **App name:** RevoShop Web
- **One-line description:** A marketplace web app where buyers browse listings and check out, sellers manage their own listings, and admins curate the catalog and moderate listings.
- **Backend:** RevoShop REST API, base path `/api/v1`, JWT bearer auth (access + 7-day refresh token).

### 2. User Roles
| Role | Description |
|------|-------------|
| Guest | Browses listings/catalog and views detail. Cannot order. |
| BUYER | Default on registration. Browses, carts, orders, pays (Midtrans), manages own profile/addresses/orders. |
| SELLER | Buyer who opted in. Creates/manages own listings (price/stock/status), sees orders containing their listings. |
| ADMIN | Curates catalog + categories, approves/rejects/suspends listings, manages users and orders. |
| SUPERADMIN | All ADMIN powers plus hard-delete and granting the SUPERADMIN role. |

> One account can hold multiple roles. Nav items and actions are shown/hidden from JWT role claims.

### 3. Features (User Stories)

**Auth** — register (email/password/age), login (JWT), Google OAuth, resend verification email, verify email via link, silent token refresh.

**Buyer** — browse/search listings with price + `min_price`, view listing detail, add to cart, create order, pay via Midtrans, view/cancel/delete own orders, manage profile + addresses (default), become a seller.

**Seller** — opt in, create listing (catalog fields + own price/stock; find-or-create catalog by barcode), view own listings by status, edit price/stock/title, toggle ACTIVE↔INACTIVE, upload/delete listing images, seller dashboard with charts, see orders containing own listings + update their status.

**Admin/Superadmin** — dashboard KPIs + charts, review PENDING listings (approve/reject), suspend/reinstate ACTIVE listings, CRUD catalog products + categories + users + orders, view any user's order history and any order's items, hard-delete (superadmin), grant SUPERADMIN (superadmin only).

### 4. Screens / Pages

> Shared shell (all pages): MUI `AppBar` + `Drawer` nav, `Container`/`Grid`/`Stack` layout,
> `Snackbar`+`Alert` toasts, `Backdrop`+`CircularProgress` blocking loads, `Skeleton` placeholders,
> `Dialog` confirms, MUI `ThemeProvider` + `CssBaseline`. Every page lists its MUI components
> and the endpoints it calls.

---

#### 4.1 Login — `/login` (public)
**Purpose:** Authenticate and obtain JWT.
**MUI components:** `Container`, `Card`, `CardContent`, `Avatar` (logo), **headline** `Typography variant="h4"` + subtitle `Typography variant="body2"`, `Box`/`Stack`, `TextField` (email), `TextField` (password) with `InputAdornment` + `IconButton` (`Visibility`/`VisibilityOff`), `FormControlLabel`+`Checkbox` (remember me), `Button variant="contained" fullWidth` (+ `CircularProgress` while pending), `Divider`, `Button variant="outlined" startIcon={<GoogleIcon/>}` (Google), `Link` (register / forgot), `Collapse`+`Alert severity="warning"` with a **"Resend verification email"** action `Button`, `Alert severity="error"`, `Snackbar`.
**States:** idle · submitting · error · needs-verification (resend alert).
**Endpoints:** `POST /auth/login`; `POST /auth/resend_verification` (resend link); `POST /auth/oauth/google` (Google); `POST /auth/refresh` (interceptor after login).

---

#### 4.2 Register — `/register` (public)
**Purpose:** Create account (defaults BUYER).
**MUI components:** `Card`, **headline** `Typography h4` + subtitle, `TextField` (email), `TextField` (password, visibility toggle, optional strength `LinearProgress`), `TextField` (age, number), `Button contained` (+ spinner), per-field `helperText` errors, `Alert` (success/error), post-success `Alert severity="info"` with a **"Resend verification email"** `Button` + `Link` to `/login`.
**Endpoints:** `POST /auth/register`; `POST /auth/resend_verification`.

---

#### 4.3 Email Confirmation — `/verify` (public)
**Purpose:** Handle `?token=` from the verification email.
**MUI components:** `Card`, `Avatar` with `CheckCircleIcon`/`ErrorIcon`, **headline** `Typography h5`, `CircularProgress` (checking), `Button contained` "Go to login", failure `Alert` + **"Resend verification email"** action.
**Endpoints:** `GET /auth/email_confirmation?token=`; `POST /auth/resend_verification`.

---

#### 4.4 Storefront / Browse — `/` (public)
**Purpose:** Browse/search ACTIVE listings, each tagged with `min_price`.
**MUI components:** `AppBar` search `TextField`+`SearchIcon` (debounced), `Drawer`/side `Paper` filters: `Autocomplete` (category), price `Slider` (min/max), `Select` (sort), `Button` apply/reset; **headline** `Typography h4`; `Grid` of `Card`+`CardMedia`+`CardContent` listing cards with title, `Chip` (category), price `Typography h6`, "from min_price" caption + `Chip` "cheapest" when `price===min_price`, `CardActions` (View / Add to cart); `Pagination`; `Skeleton` cards (loading); empty-state `Box`+`Typography`.
**Endpoints:** `GET /seller-products/?search=&category_id=&min_price=&max_price=&sort=&page=&per_page=`; `GET /categories/` (filter options).

---

#### 4.5 Listing Detail — `/listings/:id` (public)
**Purpose:** One listing + catalog spec + seller + price/stock.
**MUI components:** `Breadcrumbs`, two-column `Grid`, `ImageList` gallery / `CardMedia`, **headline** `Typography h4` (title) + `Typography subtitle1` (brand/name), spec `Table`/`List` (model/color/size/barcode/specifications), price `Typography h5`, stock/status `Chip`s, quantity `TextField` (number), `Button contained` "Add to cart" (disabled if unavailable), category `Chip`s, unavailable `Alert`.
**Endpoints:** `GET /seller-products/:id`.

---

#### 4.6 Cart & Checkout — `/cart` (BUYER)
**Purpose:** Review cart, pick address, create order, pay.
**MUI components:** `Table` cart rows (thumbnail, title, unit price, qty stepper `TextField`, line total, remove `IconButton`); order-summary `Card` with `List` (subtotal/tax/total, `Divider`); `Stepper` (Cart→Address→Payment); address `RadioGroup` + "Add address" `Button`→`Dialog`; `Button contained` "Place order" then "Pay now"; empty-cart `Alert info` + `Button`.
**Endpoints:** `POST /orders/` (items `[{seller_product_id, quantity}]`); `GET /users/me/addresses`, `POST /users/me/addresses`; `POST /payment/` → `{snap_token, redirect_url}`.

---

#### 4.7 My Orders (list) — `/orders` (BUYER)
**Purpose:** List the buyer's orders (a buyer can have many). Each row links to its detail page.
**MUI components:** **headline** `Typography h4`; status `Tabs`/`ToggleButtonGroup` (All/PENDING/PAID/COMPLETED/CANCELED); MUI X `DataGrid` (order name, status `Chip`, total, created_at) with server sort+pagination; each row's "View" navigates to `/orders/:id` (row click → `router.push`).
**Endpoints:** `GET /orders/?status=&sort=&page=&per_page=`.

#### 4.7b Order Detail — `/orders/[id]` (BUYER)
**Purpose:** Full detail of a single order — shareable URL, and the redirect target after payment.
**MUI components:** `Breadcrumbs` (Orders / #id); **headline** `Typography h4` (order name) + status `Chip`; items `Table` (title, qty, compound_price); totals `Card` (subtotal/tax/total via `List`+`Divider`); payment `Card` (payment_ref/payment_status); action `Button`s — "Pay now" (PENDING), "Cancel" (COMPLETED/CANCELED only), "Delete" — each behind a `ConfirmDialog`; `Alert` for state messages.
**Endpoints:** `GET /orders/:id`; `GET /orders/:id/products`; `PUT /orders/:id` (cancel→CANCELED); `DELETE /orders/:id`; `POST /payment/` (pay a PENDING order → Midtrans redirect back here).

---

#### 4.8 Account — Profile / Addresses / Become Seller — `/account` (any authed)
**Purpose:** Manage own profile + addresses; opt in to selling.
**MUI components:** `Tabs` (Profile · Addresses · Seller); Profile: `TextField`s (email/age), `Avatar`, `Button` save; Addresses: `List`/`Card`s, default `Chip`, add/edit `Dialog` (`TextField`s label/recipient/phone `+62`/address/city/province/postal, default `Switch`), delete `ConfirmDialog`; Seller: `Card` + `Button contained` "Become a Seller" (disabled if already) + `ConfirmDialog`.
**Endpoints:** `GET /users/me`; `PUT /users/me/profile`; `GET /users/me/addresses`; `POST /users/me/addresses`; `GET /users/me/addresses/:id`; `PUT /users/me/addresses/:id`; `DELETE /users/me/addresses/:id`; `POST /users/become-seller`.

---

#### 4.9 Seller — My Listings (list) — `/seller/listings` (SELLER)
**Purpose:** Overview of own listings across statuses; entry point to create/edit.
**MUI components:** **headline** + `Button contained startIcon={<AddIcon/>}` "New listing" → `/seller/listings/new`; status `Tabs`; MUI X `DataGrid` (thumbnail, title, price, stock, status `Chip`, actions: **Edit** → `/seller/listings/:id/edit`, ACTIVE↔INACTIVE `Switch` inline, **Delete** → `ConfirmDialog`).
**Why edit is a page, not a modal:** editing a listing includes an **image manager** (upload/delete/preview, max 4), which needs the persisted `seller_product_id` and is too heavy for a modal. So edit lives on its own route.
**Endpoints:** `GET /seller-products/mine`; `PUT /seller-products/:id` (inline status toggle only); `DELETE /seller-products/:id`.

#### 4.9b Seller — New Listing — `/seller/listings/new` (SELLER)
**Purpose:** Create a listing (Option B: catalog fields + own offer). Starts `PENDING`.
**MUI components:** `Breadcrumbs`; **headline** "New listing"; a `Stepper` or grouped `Card`s of `TextField`s — catalog: brand/name/description/model/color/size/barcode + category `Autocomplete`; listing: title/price/stock/sku; info `Alert` explaining find-or-create + PENDING. All inputs validated by `CreateListingDto` (Zod). `Button contained` "Create"; on success **redirect to `/seller/listings/:id/edit`** so the seller can immediately add images.
**Endpoints:** `POST /seller-products/`; `GET /categories/` (options).

#### 4.9c Seller — Edit Listing (+ images) — `/seller/listings/[id]/edit` (SELLER)
**Purpose:** Update the listing's own fields and manage its images.
**MUI components:** `Breadcrumbs`; **headline** with the listing title + status `Chip`; form `Card` (`TextField`s title/price/stock/sku validated by `UpdateListingDto`; status `Select` limited to ACTIVE↔INACTIVE for the seller); **Image manager `Card`** — `ImageList` of current images each with a delete `IconButton`+`ConfirmDialog`, plus an upload dropzone/`Button`+file input (client-side type/size check: png/jpg/jpeg/webp ≤ 2MB, max 4) that uploads one file at a time with per-file `LinearProgress`; `Snackbar` feedback. Read-only display of the shared catalog spec (a note that catalog edits are admin-only).
**Endpoints:** `GET /seller-products/:id`; `PUT /seller-products/:id`; `POST /uploads/` (resource `seller_products`, resource_id=:id); `DELETE /uploads/` (resource `seller_products`).

---

#### 4.10 Seller — Dashboard — `/seller/dashboard` (SELLER)
**Purpose:** Seller metrics.
**MUI components:** KPI `Card`s + `Typography` (Active listings, Pending, Units sold, Revenue) with `Skeleton`; MUI X `LineChart` (revenue over time), `BarChart` (units per listing), `PieChart` (listings by status); range `ButtonGroup` (7/30/90d); recent-orders `DataGrid`.
**Endpoints:** `GET /seller-products/mine`; `GET /orders/` (seller-scoped) + `GET /orders/:id/products` (aggregated client-side).

---

#### 4.11 Seller — Incoming Orders (list) — `/seller/orders` (SELLER)
**Purpose:** Orders that contain the seller's listings. Rows link to detail.
**MUI components:** status `Tabs`; `DataGrid` (order, buyer, status `Chip`, total, created_at); row "View" → `/seller/orders/:id`.
**Endpoints:** `GET /orders/` (seller-scoped, paginated).

#### 4.11b Seller — Order Detail — `/seller/orders/[id]` (SELLER)
**Purpose:** Inspect one order and update its fulfillment status.
**MUI components:** `Breadcrumbs`; **headline** + status `Chip`; items `Table` (only rows relevant to the seller are highlighted); totals `Card`; status update `Select`/`Button` (PAID→COMPLETED / PAID→CANCELED) + `ConfirmDialog`.
**Endpoints:** `GET /orders/:id`; `GET /orders/:id/products`; `PUT /orders/:id`.

---

#### 4.12 Admin — Dashboard — `/admin` (ADMIN/SUPERADMIN)
**Purpose:** Platform KPIs + moderation entry.
**MUI components:** KPI `Card`s (Users, Listings, Pending `Badge`, Orders today, GMV); MUI X `LineChart` (orders/revenue), `BarChart` (orders by status), `PieChart` (users by role); "Pending approvals" `Card`+`List`+"Review" `Button`.
**Endpoints:** `GET /admin/products`; `GET /orders/`; `GET /users/` (aggregated).

---

#### 4.13 Admin — Listing Moderation (list) — `/admin/listings` (ADMIN/SUPERADMIN)
**Purpose:** Queue of listings to moderate. Quick actions inline; full review on a detail page.
**MUI components:** status `Tabs` (Pending/Active/Suspended/Rejected); `DataGrid` (title, seller, catalog, price, status `Chip`, actions: **Review** → `/admin/listings/:id`, plus inline Approve/Reject/Suspend/Reinstate `Button`s → `ConfirmDialog`).
**Endpoints:** `GET /admin/products` / `GET /seller-products/`; `PUT /seller-products/:id` (inline transitions).

#### 4.13b Admin — Listing Detail — `/admin/listings/[id]` (ADMIN/SUPERADMIN)
**Purpose:** Full review of one listing before deciding.
**MUI components:** `Breadcrumbs`; **headline** listing title + status `Chip`; the listing's images `ImageList`; listing fields + full catalog spec `Table`; seller info; moderation action `Button`s (Approve `PENDING→ACTIVE`, Reject `PENDING→REJECTED`, Suspend `ACTIVE→SUSPENDED`, Reinstate `SUSPENDED→ACTIVE`) each behind a `ConfirmDialog`.
**Endpoints:** `GET /seller-products/:id`; `PUT /seller-products/:id`.

---

#### 4.14 Admin — Catalog (list) — `/admin/catalog` (ADMIN/SUPERADMIN)
**Purpose:** Browse/manage catalog products; entry to create/edit.
**MUI components:** **headline** + `Button contained startIcon={<AddIcon/>}` "New product" → `/admin/catalog/new`; search `TextField` + category `Autocomplete` + sort `Select`; `DataGrid` (brand/name/model/barcode/created_at, actions: **Edit** → `/admin/catalog/:id/edit`, **Delete** → `ConfirmDialog` with soft/hard `Select`, hard = superadmin).
**Endpoints:** `GET /products/?search=&category_id=&category_name=&sort=&page=&per_page=`; `DELETE /products/:id`.

#### 4.14b Admin — New Catalog Product — `/admin/catalog/new` (ADMIN/SUPERADMIN)
**Purpose:** Create a bare catalog product (spec only; no price/stock — those live on listings).
**MUI components:** `Breadcrumbs`; **headline**; form `Card` of `TextField`s (brand, name, description, model, color, size, barcode) + category `Autocomplete` + `specifications` JSON `TextField`, validated by `CatalogProductDto` (Zod). `Button contained` "Create" → redirect to `/admin/catalog`.
**Endpoints:** `POST /products/`; `GET /categories/` (options).

#### 4.14c Admin — Edit Catalog Product — `/admin/catalog/[id]/edit` (ADMIN/SUPERADMIN)
**Purpose:** Update catalog spec fields (shared across all sellers' listings).
**MUI components:** `Breadcrumbs`; **headline**; the same form `Card` prefilled; a note that changes affect every listing referencing this product; `Button contained` "Save".
**Endpoints:** `GET /products/:id`; `PUT /products/:id`; `GET /categories/`.

---

#### 4.15 Admin — Categories — `/admin/categories` (ADMIN/SUPERADMIN)
**Purpose:** CRUD categories.
**MUI components:** `DataGrid` (name/created_at) with search `TextField` + sort `Select`, create/edit `Dialog`, delete `ConfirmDialog`.
**Endpoints:** `GET /categories/?search=&sort=&page=&per_page=`; `GET /categories/:id`; `POST /categories/`; `PUT /categories/:id`; `DELETE /categories/:id`.

---

#### 4.16 Admin — Users — `/admin/users` (ADMIN/SUPERADMIN)
**Purpose:** Manage users + view a user's orders.
**MUI components:** `DataGrid` (username/email, role `Chip`s, `is_active` `Switch`, created_at) with search + `role`/`is_active` filters; create user `Dialog`; edit `Dialog` with roles `Select` (SUPERADMIN grant guarded → shows 403 `Alert` for admins); delete `ConfirmDialog` (soft/hard); a per-row "Orders" `Button` → navigates to `/admin/users/:id/orders`.
**Endpoints:** `GET /users/?search=&role=&is_active=&sort=&page=&per_page=`; `GET /users/:id`; `POST /users/`; `PUT /users/:id`; `DELETE /users/:id`.

#### 4.16b Admin — User's Orders — `/admin/users/[id]/orders` (ADMIN/SUPERADMIN)
**Purpose:** A specific user's order history.
**MUI components:** `Breadcrumbs`; **headline** with the username; `DataGrid` (order, status `Chip`, total, created_at); row "View" → `/admin/orders/:id`.
**Endpoints:** `GET /admin/users/:id/orders`.

---

#### 4.17 Admin — Orders (list) — `/admin/orders` (ADMIN/SUPERADMIN)
**Purpose:** Manage all orders. Rows link to detail.
**MUI components:** `DataGrid` (order, user, status `Chip`, total, created_at) with status filter + sort; row "View" → `/admin/orders/:id`.
**Endpoints:** `GET /orders/` (paginated).

#### 4.17b Admin — Order Detail — `/admin/orders/[id]` (ADMIN/SUPERADMIN)
**Purpose:** Inspect any order's items, change status, or delete it.
**MUI components:** `Breadcrumbs`; **headline** + status `Chip`; items `Table`; totals `Card`; status update `Select` + `ConfirmDialog`; delete `ConfirmDialog` (soft/hard `Select`).
**Endpoints:** `GET /orders/:id`; `GET /admin/orders/:id/products`; `PUT /orders/:id`; `DELETE /orders/:id`.

---

#### 4.18 Shared — App Shell, System & Feedback
**MUI components:** `AppBar` (logo, storefront search, cart `Badge`, account `Menu`: Profile, My Orders, Seller area if seller, Admin area if admin, Logout); role-aware `Drawer`; 404 `Box`+`Typography`+`Button`; global `Snackbar`+`Alert`, `Backdrop`+`CircularProgress`, `ConfirmDialog`; a small **health indicator** `Chip`/`Tooltip` in the footer driven by the health check; images rendered from the static file server.
**Endpoints:** `GET /api` (version in footer/about); `GET /health` (health `Chip`); `GET /uploads/<filepath>` (all `CardMedia`/`img` sources).

### 5. Out of Scope
- Real-time/websocket updates (poll or refresh on navigation).
- Native mobile app (responsive web, desktop-first).
- Offline mode.
- The Midtrans webhook `POST /payment/notification` (server-to-server; the frontend never calls it — it only initiates payment and reads resulting order status).
- A dedicated analytics API (dashboards aggregate existing list endpoints client-side).

---

## Part B — Technical

### 1. Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js (App Router)** | Server Components, Server Actions, middleware, route protection |
| Language | TypeScript | Type-safe DTOs + API responses |
| UI library | **MUI v5** — `@mui/material`, `@mui/icons-material` | All components, theming, layout |
| Data grids | **MUI X Data Grid** — `@mui/x-data-grid` | Sortable/paginated tables |
| Charts | **MUI X Charts** — `@mui/x-charts` | Dashboard line/bar/pie |
| Date pickers | **MUI X Date Pickers** — `@mui/x-date-pickers` | Date inputs/filters |
| Validation | **Zod** | DTO schemas for every form input (client + server action) |
| Session | Encrypted **cookie session** (`jose` JWT, httpOnly cookie) | Server-side auth like the Next.js auth tutorial (`lib/session.ts`) |
| Data layer | **`lib/api`** (fetch wrapper to Flask) | The ONLY data source — no `lib/db`, no ORM. All data comes from the Flask REST API |
| Forms | React Hook Form + `@hookform/resolvers/zod` + MUI `TextField` | Zod-validated forms wired to `error`/`helperText` |

> Styling exclusively via MUI (`sx`, `styled()`, theme). No Tailwind/Bootstrap.
> Data exclusively via `lib/api` → Flask. There is intentionally **no `lib/db`** — this app is a
> pure frontend for the RevoShop API and never touches a database directly.

### 2. Folder Structure (Next.js App Router)
```
revoshop-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: ThemeProvider + CssBaseline + AppShell
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── verify/page.tsx
│   │   ├── (storefront)/
│   │   │   ├── page.tsx            # Browse (/)
│   │   │   ├── listings/[id]/page.tsx
│   │   │   └── cart/page.tsx
│   │   ├── (buyer)/
│   │   │   ├── orders/page.tsx          # list of my orders
│   │   │   ├── orders/[id]/page.tsx     # one order detail (items, totals, pay/cancel)
│   │   │   └── account/page.tsx
│   │   ├── seller/
│   │   │   ├── listings/page.tsx            # my listings (list)
│   │   │   ├── listings/new/page.tsx        # create listing (form; redirects to edit on success)
│   │   │   ├── listings/[id]/edit/page.tsx  # edit listing + image upload/delete manager
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── orders/page.tsx              # orders containing my listings
│   │   │   └── orders/[id]/page.tsx         # one order detail (items, update status)
│   │   ├── admin/
│   │   │   ├── page.tsx                     # Dashboard
│   │   │   ├── listings/page.tsx            # Moderation (list)
│   │   │   ├── listings/[id]/page.tsx       # listing detail + moderation actions
│   │   │   ├── catalog/page.tsx             # catalog products (list)
│   │   │   ├── catalog/new/page.tsx         # create catalog product
│   │   │   ├── catalog/[id]/edit/page.tsx   # edit catalog product
│   │   │   ├── categories/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── users/[id]/orders/page.tsx   # a user's order history
│   │   │   ├── orders/page.tsx
│   │   │   └── orders/[id]/page.tsx         # any order detail (items, status, delete)
│   │   └── actions/                # Server Actions (validate DTO -> call lib/api -> revalidate)
│   │       ├── auth.ts             # login, register, resendVerification, logout
│   │       ├── listings.ts         # createListing, updateListing, deleteListing
│   │       ├── orders.ts           # createOrder, updateOrder, initiatePayment
│   │       ├── account.ts          # updateProfile, address CRUD, becomeSeller
│   │       └── admin.ts            # catalog/category/user/order CRUD, moderation
│   ├── components/                 # AppShell, AuthCard, ResendVerification, ListingCard,
│   │                               # FiltersPanel, StatusChip, DataTable, KpiCard, charts/,
│   │                               # ConfirmDialog, AddressDialog, ListingFormDialog, HealthChip
│   ├── lib/
│   │   ├── api.ts                  # fetch wrapper to Flask (the ONLY data layer; NO lib/db)
│   │   ├── session.ts              # encrypt/decrypt/create/verify/delete cookie session (jose)
│   │   ├── dto/                    # Zod schemas (one file per resource) — see §8
│   │   │   ├── auth.ts             # LoginDto, RegisterDto, ResendVerificationDto
│   │   │   ├── listing.ts          # CreateListingDto, UpdateListingDto
│   │   │   ├── order.ts            # CreateOrderDto, OrderItemDto, UpdateOrderStatusDto
│   │   │   ├── address.ts          # AddressDto
│   │   │   ├── catalog.ts          # CatalogProductDto, CategoryDto
│   │   │   └── user.ts             # UserUpdateDto
│   │   └── types.ts                # API response types
│   ├── context/                    # CartContext (client-only UI state)
│   ├── theme/                      # theme.ts
│   ├── middleware.ts               # session check + role-based route protection
│   └── ...
└── README.md
```

### 3. Pages & Routes
| Route | Page | Auth / Role |
|-------|------|-------------|
| /login | Login | Public |
| /register | Register | Public |
| /verify | Email Confirmation | Public |
| / | Storefront / Browse | Public |
| /listings/:id | Listing Detail | Public |
| /cart | Cart & Checkout | BUYER |
| /orders | My Orders (list) | BUYER |
| /orders/[id] | Order Detail | BUYER |
| /account | Profile / Addresses / Become Seller | Any authed |
| /seller/listings | Seller — My Listings (list) | SELLER |
| /seller/listings/new | Seller — New Listing | SELLER |
| /seller/listings/[id]/edit | Seller — Edit Listing (+ images) | SELLER |
| /seller/dashboard | Seller — Dashboard | SELLER |
| /seller/orders | Seller — Incoming Orders (list) | SELLER |
| /seller/orders/[id] | Seller — Order Detail | SELLER |
| /admin | Admin Dashboard | ADMIN/SUPERADMIN |
| /admin/listings | Listing Moderation (list) | ADMIN/SUPERADMIN |
| /admin/listings/[id] | Listing Detail (moderation) | ADMIN/SUPERADMIN |
| /admin/catalog | Catalog management (list) | ADMIN/SUPERADMIN |
| /admin/catalog/new | New Catalog Product | ADMIN/SUPERADMIN |
| /admin/catalog/[id]/edit | Edit Catalog Product | ADMIN/SUPERADMIN |
| /admin/categories | Categories management | ADMIN/SUPERADMIN |
| /admin/users | Users management | ADMIN/SUPERADMIN |
| /admin/users/[id]/orders | User's Order History | ADMIN/SUPERADMIN |
| /admin/orders | Orders management (list) | ADMIN/SUPERADMIN |
| /admin/orders/[id] | Order Detail | ADMIN/SUPERADMIN |

### 4. Key Components
| Component | MUI building blocks | Used on |
|-----------|--------------------|---------|
| AppShell | `AppBar`, `Drawer`, `Toolbar`, `Menu`, `Badge` | every page |
| AuthCard | `Card`, `Typography`, `TextField`, `Button`, `Alert`, `Collapse` | Login, Register |
| ResendVerification | `Alert`, `Button`, `Snackbar` | Login, Register, Verify |
| ListingCard | `Card`, `CardMedia`, `CardContent`, `Chip`, `Button` | Browse |
| FiltersPanel | `Autocomplete`, `Slider`, `Select`, `Button` | Browse |
| StatusChip | `Chip` | listings + orders everywhere |
| DataTable | `DataGrid` (MUI X) | Orders, Seller/Admin tables |
| KpiCard | `Card`, `Typography`, `Skeleton` | Seller/Admin dashboards |
| Charts | `LineChart`, `BarChart`, `PieChart` (MUI X) | Seller/Admin dashboards |
| ConfirmDialog | `Dialog`, `DialogActions`, `Button` | all destructive/status actions |
| AddressDialog | `Dialog`, `TextField`, `Switch` | Account, Checkout |
| ListingFormDialog | `Dialog`, `Stepper`, `TextField`, `Autocomplete`, file input | Seller listings |
| HealthChip | `Chip`, `Tooltip` | App shell footer |
| middleware.ts | (logic) | session check + role-based route guards (replaces client route guards) |

### 5. Session (server-side, Next.js tutorial pattern — `lib/session.ts`)
Auth state lives in an **encrypted, httpOnly cookie session**, mirroring the Next.js auth tutorial
(`lib/session.ts` with `jose`). We do NOT store the JWT in `localStorage`.

**What the session holds:** the Flask **access token** + **refresh token**, plus derived
`userId`, `roles`, `email`, `isActive` (decoded from the access-token JWT claims), and `expiresAt`.

**`lib/session.ts` API (as in the tutorial):**
- `encrypt(payload)` / `decrypt(cookie)` — sign/verify the session JWT with `jose` using `SESSION_SECRET`.
- `createSession(tokens)` — decode Flask JWT claims, set an httpOnly, `secure`, `sameSite:'lax'` cookie (`cookies().set('session', ...)`), 7-day expiry to match the refresh token.
- `getSession()` — read + `decrypt` the cookie in Server Components / actions; returns `null` if absent/expired.
- `updateSession()` — refresh: call `POST /auth/refresh` with the stored refresh token, re-issue the cookie.
- `deleteSession()` — logout: `cookies().delete('session')`.

**Flow:**
- Login/Register **Server Action** validates the Zod DTO → `lib/api` `POST /auth/login` → `createSession(tokens)` → `redirect('/')`.
- **`middleware.ts`** reads the session on every matched request: unauthenticated → redirect `/login`;
  wrong role for `/seller/*` or `/admin/*` → redirect `/` (or a 403 page). Role checks use `session.roles`.
- **`lib/api`** pulls the access token from the session for the `Authorization: Bearer` header. On a
  `401` it calls `updateSession()` once and retries; if that fails it calls `deleteSession()` and the
  caller redirects to `/login`.
- Logout is a Server Action → `deleteSession()` → `redirect('/login')`.

### 6. Setup & Run
```bash
## create the app
npx create-next-app@latest revoshop-web --typescript --app

## MUI + MUI X
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install @mui/x-data-grid @mui/x-charts @mui/x-date-pickers

## validation + session + forms
npm install zod jose react-hook-form @hookform/resolvers

## set environment variables (.env.local)
## API_BASE_URL=http://localhost:8000/api/v1   # server-side (lib/api, Server Actions)
## NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1   # client fetches (browse, images)
## SESSION_SECRET=<32+ char random string for jose>

## run
npm run dev
```

### 7. Endpoint Coverage Matrix (every backend endpoint is used)
| # | Method | Endpoint | Screen(s) |
|---|--------|----------|-----------|
| 1 | POST | /auth/register | 4.2 Register |
| 2 | POST | /auth/login | 4.1 Login |
| 3 | POST | /auth/oauth/google | 4.1 Login |
| 4 | POST | /auth/resend_verification | 4.1, 4.2, 4.3 |
| 5 | GET | /auth/email_confirmation | 4.3 Verify |
| 6 | POST | /auth/refresh | Shell (interceptor) |
| 7 | GET | /users/ | 4.16 Admin Users; 4.12 dashboard |
| 8 | POST | /users/ | 4.16 Admin Users |
| 9 | GET | /users/:id | 4.16 Admin Users |
| 10 | PUT | /users/:id | 4.16 Admin Users |
| 11 | DELETE | /users/:id | 4.16 Admin Users |
| 12 | GET | /users/me | 4.8 Account |
| 13 | PUT | /users/me/profile | 4.8 Account |
| 14 | POST | /users/become-seller | 4.8 Account |
| 15 | GET | /users/me/addresses | 4.8, 4.6 |
| 16 | POST | /users/me/addresses | 4.8, 4.6 |
| 17 | GET | /users/me/addresses/:id | 4.8 Account |
| 18 | PUT | /users/me/addresses/:id | 4.8 Account |
| 19 | DELETE | /users/me/addresses/:id | 4.8 Account |
| 20 | GET | /products/ | 4.14 Admin Catalog (list) |
| 21 | POST | /products/ | 4.14b New Catalog Product |
| 22 | GET | /products/:id | 4.14c Edit Catalog Product |
| 23 | PUT | /products/:id | 4.14c Edit Catalog Product |
| 24 | DELETE | /products/:id | 4.14 Admin Catalog (list) |
| 25 | GET | /seller-products/ | 4.4 Browse; 4.13 Moderation |
| 26 | POST | /seller-products/ | 4.9b New Listing |
| 27 | GET | /seller-products/mine | 4.9, 4.10 |
| 28 | GET | /seller-products/:id | 4.5; 4.9c Edit; 4.13b Detail |
| 29 | PUT | /seller-products/:id | 4.9 (toggle); 4.9c (edit); 4.13/4.13b (status) |
| 30 | DELETE | /seller-products/:id | 4.9 Seller Listings |
| 31 | GET | /categories/ | 4.4 filters; 4.9b/4.14b/4.14c forms; 4.15 |
| 32 | POST | /categories/ | 4.15 Admin Categories |
| 33 | GET | /categories/:id | 4.15 Admin Categories |
| 34 | PUT | /categories/:id | 4.15 Admin Categories |
| 35 | DELETE | /categories/:id | 4.15 Admin Categories |
| 36 | GET | /orders/ | 4.7, 4.11, 4.12, 4.17 |
| 37 | POST | /orders/ | 4.6 Checkout |
| 38 | GET | /orders/:id | 4.7b, 4.11b, 4.17b |
| 39 | PUT | /orders/:id | 4.7b, 4.11b, 4.17b |
| 40 | DELETE | /orders/:id | 4.7b, 4.17b |
| 41 | GET | /orders/:id/products | 4.7b, 4.10, 4.11b |
| 42 | POST | /payment/ | 4.6, 4.7b |
| 43 | POST | /uploads/ | 4.9c Edit Listing (image manager) |
| 44 | DELETE | /uploads/ | 4.9c Edit Listing (image manager) |
| 45 | GET | /admin/products | 4.12, 4.13 |
| 46 | GET | /admin/users/:id/orders | 4.16b User's Orders |
| 47 | GET | /admin/orders/:id/products | 4.17b Admin Order Detail |
| 48 | GET | /api | 4.18 Shell (footer/about) |
| 49 | GET | /health | 4.18 HealthChip |
| 50 | GET | /uploads/<filepath> | image sources everywhere |

> Not called by the frontend (server-to-server): `POST /payment/notification` (Midtrans webhook).

### 8. Input Validation — Zod DTOs (`lib/dto/*`)
Every form/input has a Zod schema. The **same DTO validates on the client** (via
`@hookform/resolvers/zod` → MUI `helperText`/`error`) **and inside the Server Action** before
calling `lib/api` — never trust the client alone. DTOs mirror the Flask schema rules
(email format, password ≥ 6, age ≥ 18, price ≥ 0, stock ≥ 0, phone `+62`, status enum).

```ts
// lib/dto/auth.ts
import { z } from "zod";

export const LoginDto = z.object({
  email: z.string().email("Email format is wrong."),
  password: z.string().min(1, "Password is not provided."),
});
export type LoginInput = z.infer<typeof LoginDto>;

export const RegisterDto = z.object({
  email: z.string().email("Email format is wrong."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  age: z.coerce.number().int().min(18, "You must be at least 18 years old."),
});

export const ResendVerificationDto = z.object({
  email: z.string().email("Email format is wrong."),
});
```

```ts
// lib/dto/listing.ts — POST /seller-products (catalog + offer, Option B)
import { z } from "zod";

export const CreateListingDto = z.object({
  // catalog fields (find-or-create)
  brand: z.string().min(1, "Brand is not provided."),
  name: z.string().min(1, "Product name is not provided."),
  description: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  barcode: z.string().optional(),           // dedupe key when present
  specifications: z.record(z.any()).optional(),
  category_ids: z.array(z.number().int()).default([]),
  // listing fields
  title: z.string().min(1, "Listing title is not provided."),
  price: z.coerce.number().min(0, "Price cannot be a negative number."),
  stock: z.coerce.number().int().min(0, "Stock cannot be a negative number.").default(0),
  sku: z.string().optional(),
});

export const UpdateListingDto = z.object({
  title: z.string().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  sku: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED", "REJECTED"]).optional(),
});
```

```ts
// lib/dto/order.ts
import { z } from "zod";

export const OrderItemDto = z.object({
  seller_product_id: z.number().int().positive(),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});
export const CreateOrderDto = z.object({
  name: z.string().min(1, "Order name is not provided."),
  items: z.array(OrderItemDto).min(1, "Order items are required."),
});
export const UpdateOrderStatusDto = z.object({
  status: z.enum(["PENDING", "PAID", "COMPLETED", "CANCELED"]),
});
```

```ts
// lib/dto/address.ts
import { z } from "zod";
export const AddressDto = z.object({
  label: z.string().min(1),
  recipient_name: z.string().min(1),
  phone: z.string().regex(/^\+62\d{8,13}$/, "Phone must be in +62 format."),
  address_line: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postal_code: z.string().min(1),
  is_default: z.boolean().default(false),
});
```

Other DTOs follow the same shape: `CatalogProductDto` / `CategoryDto` (`lib/dto/catalog.ts`)
for admin catalog + category CRUD, and `UserUpdateDto` (`lib/dto/user.ts`) for admin user
management (roles enum, `is_active` boolean — SUPERADMIN grant guarded server-side).

**Server Action pattern (validate → api → revalidate):**
```ts
"use server";
import { CreateListingDto } from "@/lib/dto/listing";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createListing(_prev: unknown, formData: FormData) {
  const parsed = CreateListingDto.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }; // -> MUI helperText
  }
  const res = await api.post("/seller-products/", parsed.data); // lib/api attaches bearer from session
  if (!res.ok) return { formError: res.message };
  revalidatePath("/seller/listings");
  return { ok: true };
}
```

### 9. Data Layer — `lib/api.ts` (no `lib/db`)
`lib/api` is the single data source; it wraps `fetch` to the Flask base URL. There is **no
`lib/db`** and no ORM — all reads/writes go through the REST API.

- Reads the access token from `getSession()` and sets `Authorization: Bearer <token>`.
- On `401`: call `session.updateSession()` (→ `POST /auth/refresh`) once and retry; on failure
  `deleteSession()` and signal the caller to redirect to `/login`.
- Normalizes the Flask envelope (`{ success, message, data, pagination }`) and throws typed errors
  that Server Actions convert into DTO-shaped `{ errors }` / `{ formError }` for MUI.
- Exposes `api.get/post/put/delete(path, body?, opts?)`; `opts.public` skips the bearer for public
  endpoints (browse, catalog reads, `/health`, `/api`).
- Image URLs are built against `NEXT_PUBLIC_API_BASE_URL` origin + `/uploads/<filepath>` for
  `CardMedia`/`img` sources.
