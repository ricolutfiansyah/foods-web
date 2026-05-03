Full Project Summary — FoodMart E-Commerce API
Deskripsi Project
REST API untuk platform e-commerce makanan. Dibuat untuk belajar backend Node.js modern dengan fitur production-ready.

Tech Stack

Runtime: Node.js (ES Module)
Framework: Express.js
ORM: Prisma
Database: Supabase (PostgreSQL)
Auth: JWT (Access + Refresh Token Rotation & Reuse Detection)
Image Storage: Supabase Storage
Caching: Upstash Redis (@upstash/redis)
Rate Limiting: Upstash Ratelimit (@upstash/ratelimit, Sliding Window)
Validasi: Zod
Dokumentasi: Swagger / OpenAPI 3.0
Testing: Jest + Supertest
CI: GitHub Actions


Struktur Arsitektur
Request
  → Rate Limiter (Upstash Ratelimit)
  → Router
  → Cache Middleware (Upstash Redis)
  → Validator (Zod)
  → Auth/Role Middleware
  → Controller
      → Service (business logic)
          → Repository (Prisma query)
  → Error Middleware
  → Response

Endpoints
DomainEndpointsAuthregister, login, refresh, logout, meCategoriesCRUDFoodsCRUD + image uploadCartget, add, update, remove, clearOrderscheckout, my orders, detail, update status, admin orders

Database Models

User — id, name, email, password, role (USER/ADMIN)
RefreshToken — id, token (hashed), userId, familyId, isUsed, fingerprint, expiresAt
Category — id, name, slug
Food — id, name, description, price, stock, imageUrl, imageKey, isAvailable, categoryId
Cart — id, userId
CartItem — id, cartId, foodId, quantity
Order — id, userId, totalPrice, status (PENDING/PROCESSING/COMPLETED/CANCELLED), note
OrderItem — id, orderId, foodId, quantity, priceAtOrder


Fitur yang Sudah Selesai
Session 1-7 — Core API

Setup project, Express app, middleware global
Auth lengkap dengan JWT rotation + reuse detection
CRUD Categories, Foods, Cart, Orders
Upload gambar via Supabase Storage

Session 8 — Rate Limiting

globalLimiter — 100 req/15 menit
authLimiter — 10 req/15 menit
strictLimiter — 30 req/15 menit
Skip otomatis saat NODE_ENV === 'development' atau 'test'

Session 9 — Swagger Docs

Inline JSDoc di semua route files
Swagger UI di /api-docs
BearerAuth security scheme

Session 10 — Testing

12 unit tests — AppError, pagination, jwt
57 integration tests — auth, categories, foods, cart, orders
Total: 69 tests, semua pass
Database test terpisah di Supabase
--runInBand untuk mencegah race condition

Session 11 — CI GitHub Actions

Trigger pada PR ke main
Step: install → migrate → test
Semua env via GitHub Secrets
CI pass ✅

Session 12 — Upstash Redis

src/config/redis.js — Redis client via Redis.fromEnv()
src/middlewares/cacheMiddleware.js — cache GET /foods & /categories, TTL 60 detik, support static & dynamic key
invalidateCache(...keys) — invalidate cache saat CREATE/UPDATE/DELETE
src/middlewares/rateLimiter.js — refactor ke @upstash/ratelimit Sliding Window
cross-env — fix Windows compatibility untuk NODE_ENV=test
CI diupdate: Upstash env di level job supaya tersedia sebelum module di-load
69 tests semua pass, CI hijau ✅


Keputusan Teknis Penting

Refresh token di-hash SHA-256 sebelum disimpan ke DB
Token binding via User-Agent fingerprint
Reuse detected → revoke seluruh family → user login ulang
Refresh token via httpOnly cookie — aman dari XSS
isAvailable bersifat manual — mendukung skenario pre-order
imageKey disimpan di DB untuk hapus file dari Supabase Storage
Cart dibuat otomatis saat user pertama kali tambah item
Update quantity 0 = otomatis hapus item dari cart
Kalau tambah item yang sudah ada di cart, quantity di-increment
priceAtOrder disimpan dari harga food saat checkout
Semua operasi checkout dalam satu transaksi Prisma (atomic)
GET /api/v1/admin/orders di-mount di routes/index.js
Inline JSDoc dipilih over file YAML terpisah
Cache error tidak block request — tetap next()
Rate limiter skip saat NODE_ENV === 'development' atau 'test'
Upstash env di level job CI supaya tersedia saat module initialization
beforeAll test pakai upsert untuk category — mencegah unique constraint error di CI


Konvensi Kode

ES Module (import/export) di semua file, ekstensi .js saat import lokal
authMiddleware, roleMiddleware, cacheMiddleware
AppError — import { AppError } from '../utils/AppError.js'
asyncHandler — import { asyncHandler } from '../utils/asyncHandler.js'
redis — import { redis } from '../config/redis.js'
Response format: { success, message, data, meta }
Endpoint: kebab-case /api/v1/order-items
File: camelCase foodController.js
DB table: snake_case cart_items


Status Project
Session 1-12 COMPLETED ✅

Rencana Selanjutnya
Session 13 — Frontend (React + Vite)

React + Vite (bukan Next.js)
Alasan: rencana lanjut ke React Native — konsep React murni lebih relevan
Yang akan dipelajari: komponen, hooks, TanStack Query, Zustand, JWT handling

Session entah keberapa nanti hehe — React Native

Mobile app untuk FoodMart

Lainnya (belum dijadwalkan)

CD — deploy otomatis ke Railway/Render
User Management — endpoint users yang belum dikerjakan
MCP Server — integrasi AI agent dengan FoodMart API