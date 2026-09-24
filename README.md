# Commyrce

A production-grade, Shopify-like e-commerce platform. npm-workspace monorepo:

| Path                 | Package            | Stack                                                                 |
| -------------------- | ------------------ | --------------------------------------------------------------------- |
| `apps/backend/`      | `@commyrce/backend`  | Express 5 · TypeScript · MongoDB (Mongoose 8) · Stripe · Cloudinary · Zod |
| `apps/frontend/`     | `@commyrce/frontend` | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · HeroUI v3 · Redux Toolkit + TanStack Query |
| `packages/shared/`   | `@commyrce/shared`   | Shared API-contract types (types-only, consumed by both apps)          |

Money is stored as **integer cents** everywhere (`priceCents`).

## Features

- **Storefront** — home (new arrivals + deals), product catalog with search / category / min-discount filters and pagination, product detail page (gallery, stock state, add-to-cart), cart (persisted in localStorage), Stripe Checkout flow with a success page, guest checkout (optional name/email), customer register/login/account.
- **Admin console** (`/admin`) — cookie-based sessions, dashboard (sales stats, low-stock alerts, recent orders), product management (create/edit, multi-image Cloudinary upload, publish/feature toggles, stock, discount, tags, SKU), category CRUD (auto-slug).
- **Payments** — Stripe Checkout sessions created server-side with quantity-restricted line items; orders are created and stock decremented only from the verified `checkout.session.completed` webhook.
- **Security** — Helmet, CORS allowlist, JSON body limit, per-route rate limiting, rate-limit-consistency validation, Zod validation on all inputs, bcrypt password hashing, signed HttpOnly cookies, admin guard middleware.
- **Media** — multer in-memory → Cloudinary, max 8 images/product.

## Requirements

- Node.js ≥ 20, npm, MongoDB (local or `mongodb://localhost:27017`), a `mongod` instance or the provided Docker service (see Docker below).
- Cloudinary account (for uploads) and Stripe keys (for checkout). Without real keys, uploads error gracefully and checkout cannot create sessions.

## Getting started (development)

Everything is installed from the **repo root** (single `node_modules`, one lockfile):

```bash
npm install          # one install for all workspaces
npm run dev          # starts API (:3001) + frontend (:3000) together
```

### Env files

```bash
cp apps/backend/.env.example apps/backend/.env       # fill in secrets
cp apps/frontend/.env.local.example apps/frontend/.env.local   # points at http://localhost:3001
```

### Seed the database

```bash
npm run seed         # creates admin + 6 categories + 15 products
```

### Per-workspace commands

```bash
npm run dev -w @commyrce/backend      # API only  → http://localhost:3001
npm run dev -w @commyrce/frontend     # web only  → http://localhost:3000
npm run build -w @commyrce/shared     # rebuild shared types (types-only)
```

Both apps must run with cookies: `localhost:3000 → localhost:3001` is a same-site boundary, so cookies flow automatically with `credentials: 'include'`.

### Demo admin (created by the seed)

```
Email:    admin@commyrce.com
Password: Admin123!
```

## Environment variables

**Backend** (`.env`, see `apps/backend/.env.example`):

| Variable                  | Description                                   |
| ------------------------- | --------------------------------------------- |
| `PORT`                    | API port (default 3001)                       |
| `MONGO_URI`               | MongoDB connection string                     |
| `CORS_ORIGINS`            | Comma-separated allowed origins               |
| `FRONTEND_ORIGIN`         | Frontend origin (used by checkout redirects)  |
| `JWT_SECRET` / `ADMIN_JWT_SECRET` | Signing secrets for user/admin cookies |
| `CLOUDINARY_*`            | Cloudinary credentials for image uploads      |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe keys                  |
| `SEED_ADMIN_*`            | Credentials used by `npm run seed`            |

**Frontend** (`.env.local`):

| Variable                      | Description                    |
| ----------------------------- | ------------------------------ |
| `API_BASE_ENDPOINT`           | Server-side fetch base URL     |
| `NEXT_PUBLIC_API_BASE_ENDPOINT` | Client-side API base URL     |

## API surface (abridged)

```
GET  /api/health
GET  /api/products                     # q, category, categorySlug, minDiscount, sort, page, limit
GET  /api/products/categories
GET  /api/products/deals               # minDiscount, limit
GET  /api/products/:slug
GET  /api/auth/me | POST /api/auth/login | POST /api/auth/register | POST /api/auth/logout
POST /api/checkout                     { items:[{productId,quantity}], name?, email? } -> { url }
POST /api/webhooks/stripe              # Stripe signature-verified
GET  /api/orders/:orderNumber          # customer order lookup
POST /api/uploads                      # admin, FormData field "images" (max 8) -> { urls }
# Admin (cookie-authed)
POST /api/admin/auth/login | GET /api/admin/auth/check | POST /api/admin/auth/logout
GET  /api/admin/dashboard
GET  /api/admin/products | POST /api/admin/products | GET/PATCH/DELETE /api/admin/products/:id
GET  /api/admin/categories | POST /api/admin/categories | PATCH/DELETE /api/admin/categories/:id
```

## Tests & checks

Run all from the repo root:

```bash
npm run typecheck    # tsc --noEmit for backend + frontend
npm run lint         # eslint (flat config + next/core-web-vitals) on the frontend
npm run build        # shared → backend → frontend
npm test             # vitest (unit + no-DB smoke)
```

## Docker

`docker-compose.yml` builds the **backend** and **frontend** from the repo root (`dockerfile: apps/*/Dockerfile`) and starts them alongside **MongoDB**.

### Spin-up steps

```bash
# 1. (Windows) Make sure Docker Desktop is running
docker info                     # should not error

# 2. Create env files from the templates (add real Stripe/Cloudinary keys)
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# 3. Build images and start the stack (run again with --build to rebuild after changes)
docker compose up --build -d

# 4. Seed the database (admin user + categories + sample products)
docker compose exec -w /app backend npm run seed -w @commyrce/backend

# 5. Watch logs
docker compose logs -f backend frontend
```

### Which MongoDB instance to use

The hosted MongoDB container is named `commyrce-mongo` and listens on `27017` — it is shared between the Docker services **and** any locally-running `npm run dev` servers.

- In the **Docker backend service**, the connection string is overridden to `mongodb://mongo:27017/commyrce` by `docker-compose.yml`, so the container reaches its sibling.
- A **locally-run backend** (`npm run dev`) uses whatever `MONGO_URI` you put in `apps/backend/.env` (e.g. `mongodb://localhost:27017/commyrce`).

If you are only running locally, no need to start the Docker stack — Docker is only required when you want the whole stack (DB + API + frontend) containerized.

### Usage

- MongoDB: `mongodb://localhost:27017`
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

## Project layout

```
apps/
  backend/
    src/
      server.ts            # bootstrap + listen
      app.ts               # express app assembly
      config/
      models/              # Product, Category, User, Order (Mongoose 8)
      middlewares/         # auth, rate-limit, upload, error, validate
      validators/          # zod schemas (objects, arrays, pagination...)
      services/            # category, order, product, stripe, upload
      controllers/
      routes/
      scripts/seed.ts
    tests/
  frontend/
    app/                   # App Router pages (storefront + /admin)
    components/            # shared UI (Header, ShopPage, ProductForm, ButtonLink...)
    lib/                   # api client, hooks, formatting
    store/                 # Redux cart slice
packages/
  shared/
    src/index.ts           # shared API-contract types (@commyrce/shared)
```