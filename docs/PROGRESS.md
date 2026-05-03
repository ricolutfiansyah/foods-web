# PROGRESS — FoodMart E-Commerce API

## Status: COMPLETED ✅ (Session 1-12)

---

## Sedang Dikerjakan
(kosong)

## Belum Dimulai
- [ ] Session 13 — Frontend (React + Vite)
- [ ] Session 14 — React Native
- [ ] CD — deploy otomatis ke Railway/Render
- [ ] User Management — endpoint users yang belum dikerjakan
- [ ] MCP Server — integrasi AI agent dengan FoodMart API

## Selesai

### Session 1-7 — Core API
- [x] Inisialisasi project (package.json, struktur folder)
- [x] Setup Express app (index.js, app.js)
- [x] Setup middleware global (cors, helmet, json parser, cookie-parser)
- [x] Health check endpoint GET /health
- [x] Buat semua model di schema.prisma + migrate ke Supabase
- [x] src/utils/asyncHandler.js
- [x] src/utils/AppError.js
- [x] src/utils/response.js
- [x] src/utils/jwt.js (hashToken & fingerprintRequest)
- [x] src/utils/pagination.js
- [x] POST /api/v1/auth/register
- [x] POST /api/v1/auth/login
- [x] POST /api/v1/auth/refresh
- [x] POST /api/v1/auth/logout
- [x] GET /api/v1/auth/me
- [x] authMiddleware, roleMiddleware, errorMiddleware
- [x] authValidator, authRepository, authService, authController
- [x] src/config/supabase.js
- [x] src/middlewares/upload.js
- [x] src/validators/foodValidator.js
- [x] src/repositories/categoryRepository.js
- [x] src/services/categoryService.js
- [x] src/controllers/categoryController.js
- [x] src/routes/categoryRoutes.js
- [x] src/repositories/foodRepository.js
- [x] src/services/foodService.js
- [x] src/controllers/foodController.js
- [x] src/routes/foodRoutes.js
- [x] src/validators/cartValidator.js
- [x] src/repositories/cartRepository.js
- [x] src/services/cartService.js
- [x] src/controllers/cartController.js
- [x] src/routes/cartRoutes.js
- [x] src/validators/orderValidator.js
- [x] src/repositories/orderRepository.js
- [x] src/services/orderService.js
- [x] src/controllers/orderController.js
- [x] src/routes/orderRoutes.js
- [x] Update src/routes/index.js (semua routes + /api/v1/admin/orders)

### Session 8 — Rate Limiting
- [x] src/middlewares/rateLimiter.js (globalLimiter, authLimiter, strictLimiter)
- [x] Update src/app.js (pasang globalLimiter + mount Swagger UI di /api-docs)
- [x] Update src/routes/authRoutes.js (pasang authLimiter & strictLimiter + JSDoc)

### Session 9 — Swagger Docs
- [x] src/config/swagger.js (setup swagger-jsdoc, OpenAPI 3.0, BearerAuth)
- [x] Update src/routes/categoryRoutes.js (JSDoc)
- [x] Update src/routes/foodRoutes.js (JSDoc)
- [x] Update src/routes/cartRoutes.js (JSDoc)
- [x] Update src/routes/orderRoutes.js (JSDoc)

### Session 10 — Testing
- [x] babel.config.json (konfigurasi Babel untuk ES Module di Jest)
- [x] tests/setup.js (override DATABASE_URL ke DATABASE_URL_TEST)
- [x] tests/unit/utils.test.js (12 unit tests)
- [x] tests/integration/auth.test.js (10 integration tests)
- [x] tests/integration/category.test.js (11 integration tests)
- [x] tests/integration/food.test.js (12 integration tests)
- [x] tests/integration/cart.test.js (10 integration tests)
- [x] tests/integration/order.test.js (14 integration tests)

### Session 11 — CI GitHub Actions
- [x] .github/workflows/ci.yml (GitHub Actions CI pipeline)

### Session 12 — Upstash Redis
- [x] src/config/redis.js (Upstash Redis client via Redis.fromEnv())
- [x] src/middlewares/cacheMiddleware.js (cacheMiddleware + invalidateCache helper)
- [x] Update src/routes/foodRoutes.js (pasang cacheMiddleware di GET routes)
- [x] Update src/routes/categoryRoutes.js (pasang cacheMiddleware di GET routes)
- [x] Update src/controllers/foodController.js (cache invalidation di POST/PATCH/DELETE)
- [x] Update src/controllers/categoryController.js (cache invalidation di POST/PATCH/DELETE)
- [x] Refactor src/middlewares/rateLimiter.js (@upstash/ratelimit Sliding Window)
- [x] Update package.json (tambah cross-env, fix NODE_ENV di script test)
- [x] Update .github/workflows/ci.yml (Upstash env di level job)
- [x] Fix tests/integration/food.test.js (upsert + deleteMany by slug di afterAll)
- [x] Fix tests/integration/order.test.js (upsert + deleteMany by slug di afterAll)

---

## Catatan & Keputusan Teknis

### Auth
- Refresh token: Rotation + Reuse Detection
- Refresh token via httpOnly cookie, di-hash SHA-256 sebelum disimpan
- Token binding via User-Agent fingerprint
- Reuse detected → revoke seluruh family → user login ulang

### Database
- Supabase (PostgreSQL) untuk database utama
- Supabase Storage untuk gambar produk (bukan Cloudinary)
- UUID untuk semua PK
- Password connection string perlu di-encode jika mengandung karakter spesial

### Foods & Cart
- isAvailable bersifat manual — mendukung skenario pre-order
- imageKey disimpan di DB untuk hapus file dari Supabase Storage
- Cart dibuat otomatis saat user pertama kali tambah item
- Update quantity 0 = otomatis hapus item dari cart
- Jika tambah item yang sudah ada di cart, quantity di-increment
- priceAtOrder disimpan dari harga food saat checkout (bukan harga sekarang)
- Semua operasi checkout dalam satu transaksi Prisma (atomic)

### Routing & Middleware
- GET /api/v1/admin/orders di-mount langsung di routes/index.js (bukan di orderRoutes)
- Middleware export: authMiddleware (bukan protect), roleMiddleware (bukan adminOnly)
- ES Module (import/export) di semua file, ekstensi .js saat import lokal

### Swagger
- Inline JSDoc di route files, bukan file YAML terpisah
- swagger-jsdoc scan otomatis semua file di src/routes/*.js
- Base URL dibaca dari env BASE_URL, fallback ke http://localhost:3000

### Testing
- Jest + Supertest untuk testing
- Babel untuk support ES Module di Jest
- --runInBand agar test berjalan berurutan, mencegah race condition antar test suite
- Database test terpisah di Supabase, dikonfigurasi via DATABASE_URL_TEST di .env
- Cleanup data di afterAll setiap test suite sesuai urutan foreign key constraint
- Role ADMIN di-set langsung via Prisma di beforeAll test
- beforeAll pakai upsert untuk category — mencegah unique constraint error di CI
- afterAll pakai deleteMany by slug untuk category — tidak crash kalau ID kosong
- Total: 69 tests, semua pass
- cross-env dipakai untuk set NODE_ENV=test di Windows

### CI
- GitHub Actions — trigger pada pull_request ke main
- Prisma migrate deploy dijalankan di CI sebelum test
- testTimeout dinaikkan ke 30000ms untuk CI environment
- Upstash env di-set di level job (bukan step) — supaya tersedia saat module initialization

### Caching (Upstash Redis)
- Cache middleware intercept res.json untuk capture response sebelum dikirim
- Hanya cache response dengan body.success === true
- Cache key bisa static string atau function (req) => string untuk dynamic key
- Cache invalidation dilakukan di controller, bukan di middleware
- invalidateCache helper mendukung multiple keys sekaligus
- Redis error di cache middleware tidak block request — fallback ke next()
- TTL: 60 detik
- Prefix key: foods:all, foods:{id}, categories:all, categories:{id}

### Rate Limiting (Upstash Ratelimit)
- Migrasi dari express-rate-limit (memory store) ke @upstash/ratelimit
- Algoritma: Sliding Window — lebih fair, tidak ada reset spike
- Identifier pakai IP address (req.ip atau x-forwarded-for)
- Response header X-RateLimit-Limit dan X-RateLimit-Remaining dikirim ke client
- Skip otomatis saat NODE_ENV === 'development' atau 'test'
- Redis error di rate limiter tidak block request — fallback ke next()
- Prefix 'rl:' untuk rate limiter keys agar tidak bentrok dengan cache keys