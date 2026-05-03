# PRD — FoodMart E-Commerce API

## Deskripsi
REST API untuk platform e-commerce makanan. Project ini dibuat untuk belajar
backend Node.js modern dengan PostgreSQL (Supabase), ORM Prisma, dan fitur-fitur
production-ready seperti auth, upload gambar, rate limiting, caching, dan dokumentasi API.

## Tech Stack
- **Runtime**: Node.js (ES Module)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT (access token + refresh token dengan Rotation & Reuse Detection)
- **Upload Gambar**: Supabase Storage
- **Caching**: Upstash Redis (`@upstash/redis`)
- **Rate Limiting**: Upstash Ratelimit (`@upstash/ratelimit`, Sliding Window)
- **Dokumentasi**: Swagger / OpenAPI 3.0
- **Validasi**: Zod
- **Testing**: Jest + Supertest
- **CI**: GitHub Actions
- **Env**: dotenv

## Aktor
- **Guest** — bisa lihat produk & kategori tanpa login
- **User** — bisa order, kelola cart, lihat history
- **Admin** — bisa kelola produk, kategori, dan lihat semua order

---

## Fitur & Endpoint

### Auth
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|-----------|
| POST | /api/v1/auth/register | Guest | Daftar akun baru |
| POST | /api/v1/auth/login | Guest | Login, dapat access + refresh token |
| POST | /api/v1/auth/refresh | User | Perbarui access token |
| POST | /api/v1/auth/logout | User | Invalidate refresh token |
| GET | /api/v1/auth/me | User | Info user yang sedang login |

### Users (Admin only)
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|-----------|
| GET | /api/v1/users | Admin | List semua user |
| GET | /api/v1/users/:id | Admin | Detail user |
| PATCH | /api/v1/users/:id | Admin | Update role user |
| DELETE | /api/v1/users/:id | Admin | Hapus user |

### Categories
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|-----------|
| GET | /api/v1/categories | Guest | List semua kategori (cached) |
| GET | /api/v1/categories/:id | Guest | Detail kategori (cached) |
| POST | /api/v1/categories | Admin | Tambah kategori |
| PATCH | /api/v1/categories/:id | Admin | Edit kategori |
| DELETE | /api/v1/categories/:id | Admin | Hapus kategori |

### Foods (Produk)
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|-----------|
| GET | /api/v1/foods | Guest | List produk (support filter & search, cached) |
| GET | /api/v1/foods/:id | Guest | Detail produk (cached) |
| POST | /api/v1/foods | Admin | Tambah produk + upload gambar |
| PATCH | /api/v1/foods/:id | Admin | Edit produk |
| DELETE | /api/v1/foods/:id | Admin | Hapus produk |

### Cart
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|-----------|
| GET | /api/v1/cart | User | Lihat isi cart |
| POST | /api/v1/cart | User | Tambah item ke cart |
| PATCH | /api/v1/cart/:itemId | User | Update quantity |
| DELETE | /api/v1/cart/:itemId | User | Hapus item dari cart |
| DELETE | /api/v1/cart | User | Kosongkan cart |

### Orders
| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|-----------|
| GET | /api/v1/orders | User | List order milik user |
| GET | /api/v1/orders/:id | User | Detail order |
| POST | /api/v1/orders | User | Checkout dari cart |
| PATCH | /api/v1/orders/:id/status | Admin | Update status order |
| GET | /api/v1/admin/orders | Admin | List semua order |

---

## Model Database

### User
- id (uuid, PK)
- name (string)
- email (string, unique)
- password (string, hashed)
- role (enum: USER | ADMIN, default USER)
- createdAt, updatedAt

### RefreshToken
- id (uuid, PK)
- token (string, unique) ← disimpan dalam bentuk hash SHA-256
- userId (FK → User)
- familyId (string) ← group semua token dalam satu sesi login
- isUsed (boolean, default false) ← untuk deteksi reuse attack
- fingerprint (string, optional) ← hash dari User-Agent
- expiresAt (datetime)
- createdAt

### Category
- id (uuid, PK)
- name (string, unique)
- slug (string, unique)
- createdAt, updatedAt

### Food
- id (uuid, PK)
- name (string)
- description (string, optional)
- price (decimal)
- stock (int)
- imageUrl (string, optional)
- imageKey (string, optional) ← key untuk hapus dari Supabase Storage
- isAvailable (boolean, default true)
- categoryId (FK → Category)
- createdAt, updatedAt

### Cart
- id (uuid, PK)
- userId (FK → User, unique) ← satu user satu cart
- createdAt, updatedAt

### CartItem
- id (uuid, PK)
- cartId (FK → Cart)
- foodId (FK → Food)
- quantity (int)
- createdAt, updatedAt

### Order
- id (uuid, PK)
- userId (FK → User)
- totalPrice (decimal)
- status (enum: PENDING | PROCESSING | COMPLETED | CANCELLED)
- note (string, optional)
- createdAt, updatedAt

### OrderItem
- id (uuid, PK)
- orderId (FK → Order)
- foodId (FK → Food)
- quantity (int)
- priceAtOrder (decimal) ← harga saat order, bukan harga sekarang
- createdAt

---

## Fitur Non-Fungsional
- [x] Rate limiting — Upstash Ratelimit, Sliding Window (global 100/15m, auth 10/15m, strict 30/15m)
- [x] Global error handler middleware
- [x] Async handler wrapper (tidak perlu try/catch di tiap controller)
- [x] Validasi input dengan Zod di semua endpoint
- [x] Swagger UI tersedia di /api-docs
- [x] Response format konsisten: { success, message, data, meta }
- [x] Pagination pada endpoint list (page, limit, total)
- [x] Search & filter pada endpoint /foods
- [x] Refresh token rotation + reuse detection
- [x] Refresh token via httpOnly cookie
- [x] Token binding via User-Agent fingerprint
- [x] Auto-revoke seluruh family token jika reuse terdeteksi
- [x] Caching response API — GET /foods & /categories via Upstash Redis (TTL 60s)
- [x] Cache invalidation otomatis saat CREATE/UPDATE/DELETE
- [x] 69 automated tests (12 unit + 57 integration) — semua pass
- [x] CI pipeline via GitHub Actions — trigger pada PR ke main