# ShopSphere Pro

Production-ready multi-vendor e-commerce SaaS platform.

ShopSphere Pro is a full-stack marketplace application designed as a professional portfolio project for a European full-stack developer profile.  
It demonstrates end-to-end product thinking: secure authentication, multi-role dashboards, transactional flows, and deployable cloud-ready architecture.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-black)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

---

## Project Summary

ShopSphere Pro is a marketplace SaaS where:
- **Customers** discover products, manage cart/wishlist, checkout, track orders, and leave verified reviews.
- **Sellers** manage catalog, inventory, and orders through a dedicated dashboard with analytics.
- **Admins** govern platform quality through user/seller moderation, product/category controls, and platform analytics.

Built to showcase production-grade full-stack engineering: RBAC security, payment workflow design, strong DX, and deployability.

### Key Features

- Role-based authentication and authorization (`CUSTOMER`, `SELLER`, `ADMIN`)
- End-to-end commerce flow: catalog → cart → checkout → order lifecycle
- Seller and admin operational dashboards
- Stripe-ready checkout with webhook-based fulfillment path
- Dockerized setup with Prisma + PostgreSQL backend

---

## Features

### Customer
- Authentication
- Product browsing
- Cart
- Wishlist
- Checkout
- Orders
- Reviews

### Seller
- Seller dashboard
- Product management
- Inventory
- Sales analytics
- Order management

### Admin
- User management
- Seller approval
- Product moderation
- Analytics

---

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn UI
- Prisma
- PostgreSQL
- Auth.js
- Stripe
- Docker

---

## Architecture Overview

ShopSphere Pro follows a role-based monolith architecture with clear domain boundaries:

- **Frontend:** Next.js App Router with route groups for storefront and role-specific dashboards.
- **Backend:** Server Actions + API routes for payments/uploads/webhooks.
- **Data layer:** Prisma ORM on PostgreSQL.
- **Auth/RBAC:** Auth.js with JWT sessions, middleware checks, and server-side role validation.
- **Payments:** Stripe Checkout (with webhook fulfillment path).
- **Deployment:** Docker-ready standalone Next.js build.

### High-level module layout

```text
src/
  app/
    (shop)/          # Customer storefront routes
    (dashboard)/     # Seller + Admin dashboards
    api/             # Auth, Stripe webhook, upload endpoints
  actions/           # Server actions per domain
  components/        # UI components by feature area
  lib/               # Auth, Prisma, payments, helpers
prisma/
  schema.prisma
Dockerfile
docker-compose.yml
```

---

## Installation

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (local or containerized)
- Docker (recommended for local database and container testing)

### 1) Clone and install dependencies

```bash
git clone <your-repo-url>
cd shopsphere-pro
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Generate secure auth secrets:

```bash
openssl rand -base64 32
```

Paste the generated value into `AUTH_SECRET` and `NEXTAUTH_SECRET`.

### 3) Start PostgreSQL (Docker option)

```bash
docker compose up -d postgres
```

### 4) Initialize database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5) Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables Example

Use `.env.example` as the source of truth.

```env
# Database
DATABASE_URL="postgresql://shopsphere:shopsphere@localhost:5432/shopsphere?schema=public"

# Auth.js / NextAuth
AUTH_SECRET="replace_with_secure_random_string"
NEXTAUTH_SECRET="replace_with_secure_random_string"
NEXTAUTH_URL="http://localhost:3000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""
```

---

## Demo Accounts

Password for all accounts: `password123`

| Role | Email | Redirect |
|------|-------|----------|
| Admin | `admin@shopsphere.com` | `/admin/dashboard` |
| Seller | `seller@shopsphere.com` | `/seller/dashboard` |
| Seller | `merchant@shopsphere.com` | `/seller/dashboard` |
| Customer | `customer@shopsphere.com` | `/profile` |

---

## Screenshots

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Runtime/Error State Example
![Error State](docs/screenshots/error-state.png)

Planned additions:
- Home
- Products
- Seller Dashboard
- Checkout

---

## Deployment Guide

### Option A: Docker deployment

```bash
cp .env.example .env
# fill in production values
docker compose --profile full up --build -d
```

Then run schema + seed once inside the app container:

```bash
docker exec -it shopsphere-app npx prisma db push
docker exec -it shopsphere-app npm run db:seed
```

### Option B: Vercel + managed PostgreSQL

1. Push repository to GitHub.
2. Import project into Vercel.
3. Add all required environment variables.
4. Connect managed PostgreSQL (Neon/Supabase/Vercel Postgres).
5. Run migrations (`prisma migrate deploy`) during deploy.
6. Configure Stripe webhook to:
   - `https://<your-domain>/api/stripe/webhook`
7. Deploy and verify auth, checkout, and dashboards.

### Production checklist

- Use strong secrets (`AUTH_SECRET`, `NEXTAUTH_SECRET`)
- Use HTTPS URLs for `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`
- Configure Stripe keys + webhook secret
- Configure Cloudinary for uploads
- Configure email provider for transactional notifications

---

## Portfolio Positioning

ShopSphere Pro is suitable for showcasing:

- Full-stack TypeScript architecture
- Multi-role RBAC implementation
- Payment and order lifecycle design
- Production readiness (Docker, env strategy, deployment path)
- Real-world product domain complexity (customer/seller/admin flows)
