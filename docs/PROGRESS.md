# PROGRESS — FoodMart E-Commerce API

## Status: Session 6 — Cart (selesai)

---

## Sedang Dikerjakan
(kosong)

## Belum Dimulai
- [ ] Orders
- [ ] Rate limiting, Swagger, Polish

## Selesai
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
- [x] Update src/routes/index.js (categories, foods, cart)

## Catatan & Keputusan Teknis
- Supabase Storage untuk gambar produk (bukan Cloudinary)
- Refresh token: Rotation + Reuse Detection
- Refresh token via httpOnly cookie, di-hash SHA-256 sebelum disimpan
- Token binding via User-Agent fingerprint
- Reuse detected → revoke seluruh family → user login ulang
- UUID untuk semua PK
- Zod untuk validasi
- ES Module (import/export) di semua file
- Middleware export: authMiddleware (bukan protect), roleMiddleware (bukan adminOnly)
- isAvailable bersifat manual — mendukung skenario pre-order
- imageKey disimpan di DB untuk hapus file dari Supabase Storage
- Cart dibuat otomatis saat user pertama kali tambah item
- Update quantity 0 = otomatis hapus item dari cart
- Jika tambah item yang sudah ada di cart, quantity di-increment