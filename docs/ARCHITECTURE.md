# ARCHITECTURE — FoodMart E-Commerce API

## Struktur Folder

```
foodmart-api/
├── prisma/
│   └── schema.prisma          # semua model database
├── src/
│   ├── index.js               # entry point, setup Express & middleware global
│   ├── app.js                 # konfigurasi app Express (pisah dari server)
│   ├── routes/
│   │   ├── index.js           # gabungkan semua route
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── foodController.js
│   │   ├── cartController.js
│   │   └── orderController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── categoryService.js
│   │   ├── foodService.js
│   │   ├── cartService.js
│   │   └── orderService.js
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── categoryRepository.js
│   │   ├── foodRepository.js
│   │   ├── cartRepository.js
│   │   └── orderRepository.js
│   ├── middlewares/
│   │   ├── authMiddleware.js   # verifikasi JWT
│   │   ├── roleMiddleware.js   # cek role (admin/user)
│   │   ├── errorMiddleware.js  # global error handler
│   │   ├── rateLimiter.js      # rate limiting via @upstash/ratelimit (Sliding Window)
│   │   ├── cacheMiddleware.js  # cache middleware + invalidateCache helper
│   │   └── upload.js           # middleware Supabase Storage upload
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── foodValidator.js
│   │   ├── cartValidator.js
│   │   └── orderValidator.js
│   ├── utils/
│   │   ├── asyncHandler.js     # wrapper async untuk controller
│   │   ├── AppError.js         # custom error class
│   │   ├── response.js         # helper format response konsisten
│   │   ├── jwt.js              # helper sign & verify token
│   │   └── pagination.js       # helper pagination query
│   ├── config/
│   │   ├── prisma.js           # Prisma client singleton
│   │   ├── redis.js            # Upstash Redis client (Redis.fromEnv())
│   │   ├── supabase.js         # Supabase client (untuk Storage)
│   │   └── swagger.js          # konfigurasi Swagger
│   └── docs/
│       └── swagger.yaml        # OpenAPI spec (opsional, bisa inline)
├── tests/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── category.test.js
│   │   ├── food.test.js
│   │   ├── cart.test.js
│   │   └── order.test.js
│   ├── unit/
│   │   └── utils.test.js
│   └── setup.js               # konfigurasi Jest + database test
├── .github/
│   └── workflows/
│       └── ci.yml             # CI pipeline (install → migrate → test)
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## Alur Request

```
Request
  → Rate Limiter (Upstash Ratelimit — Sliding Window)
  → Router
  → Cache Middleware (Upstash Redis) ← khusus GET /foods & /categories
  → Validator (Zod)
  → Auth/Role Middleware (jika butuh)
  → Controller (terima req, kirim res)
      → Service (logika bisnis)
          → Repository (query database via Prisma)
  → Error Middleware (tangkap semua error)
  → Response
```

---

## Konvensi Penamaan

| Hal | Format | Contoh |
|-----|--------|--------|
| File | camelCase | `foodController.js` |
| Variabel / fungsi | camelCase | `getAllFoods` |
| Tabel DB | snake_case | `cart_items` |
| Kolom DB | camelCase (Prisma default) | `createdAt` |
| Endpoint | kebab-case | `/api/v1/order-items` |
| Env variable | UPPER_SNAKE | `JWT_SECRET` |

---

## Format Response

Semua endpoint wajib menggunakan format ini:

```json
// Sukses
{
  "success": true,
  "message": "Foods retrieved successfully",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 100 }
}

// Error
{
  "success": false,
  "message": "Food not found",
  "errors": [ ... ]   // opsional, untuk validasi
}
```

---

## Error Handling

- Semua controller dibungkus `asyncHandler(fn)` — tidak perlu try/catch manual
- Throw `new AppError("pesan", statusCode)` untuk error yang sudah diketahui
- Error yang tidak tertangkap masuk ke `errorMiddleware` di `app.js`
- Error Prisma (P2002, P2025, dll) di-handle di errorMiddleware secara terpusat

```js
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

---

## Auth Flow

```
Register
  → validasi input (Zod)
  → cek email belum terdaftar
  → hash password (bcrypt, salt 10)
  → simpan user
  → return user (tanpa password)

Login
  → cek email terdaftar
  → verifikasi password (bcrypt.compare)
  → buat familyId baru (uuid)
  → buat access token (15m, JWT)
  → buat refresh token (JWT, 7d)
  → hash refresh token sebelum disimpan ke DB
  → simpan ke DB: { token: hashedToken, familyId, isUsed: false, fingerprint, expiresAt }
  → kirim access token di response body
  → kirim refresh token via httpOnly cookie

Refresh Token
  → baca refresh token dari httpOnly cookie
  → verifikasi JWT signature & expiry
  → cari token di DB berdasarkan hash
  → cek isUsed:
      → kalau true (REUSE DETECTED!):
          → revoke semua token dengan familyId yang sama
          → throw 401 "Session compromised, please login again"
  → cek fingerprint cocok dengan request saat ini
      → kalau tidak cocok → revoke family → throw 401
  → tandai token lama: isUsed = true
  → buat refresh token baru (familyId SAMA)
  → simpan token baru ke DB
  → return access token baru + set cookie refresh token baru

Logout
  → baca refresh token dari cookie
  → tandai isUsed = true di DB
  → clear httpOnly cookie
```

### Kenapa httpOnly Cookie?
- Refresh token tidak bisa diakses JavaScript → aman dari XSS
- `sameSite: strict` → proteksi CSRF
- `secure: true` → hanya dikirim via HTTPS (aktifkan di production)

### Kenapa token di-hash sebelum disimpan ke DB?
- Kalau DB bocor, attacker tidak bisa langsung pakai token mentah
- Simpan hash (SHA-256) di DB, bandingkan saat refresh

---

## Caching (Upstash Redis)

```
GET /foods atau /categories
  → cacheMiddleware cek Redis
      → Cache HIT  → return langsung dari Redis (controller tidak disentuh)
      → Cache MISS → lanjut ke controller → response di-intercept → simpan ke Redis (TTL 60s)

POST / PATCH / DELETE /foods atau /categories
  → controller jalan
  → invalidateCache(...keys) dipanggil setelah operasi sukses
  → key yang relevan dihapus dari Redis
```

**Cache keys:**
- `foods:all` — list semua food
- `foods:{id}` — detail food by id
- `categories:all` — list semua category
- `categories:{id}` — detail category by id

**Aturan:**
- Cache error tidak block request — tetap `next()`
- `invalidateCache` dipanggil di controller, bukan di middleware
- Cache hanya disimpan kalau `body.success === true`

---

## Rate Limiting (Upstash Ratelimit)

Menggunakan algoritma **Sliding Window** via `@upstash/ratelimit`.

| Limiter | Limit | Window | Endpoint |
|---|---|---|---|
| `globalLimiter` | 100 req | 15 menit | semua endpoint |
| `authLimiter` | 10 req | 15 menit | login, register |
| `strictLimiter` | 30 req | 15 menit | refresh token |

**Aturan:**
- Skip otomatis saat `NODE_ENV === 'development'` atau `'test'`
- Kalau Redis error → tetap `next()`, tidak block request
- Identifier pakai IP address (`req.ip` atau `x-forwarded-for`)
- Response header `X-RateLimit-Limit` dan `X-RateLimit-Remaining` dikirim ke client

---

## Upload Gambar (Supabase Storage)

```
Request dengan file
  → middleware upload.js (multer — simpan di memory, tidak ke disk)
  → service uploadToSupabase(buffer, filename)
      → supabase.storage.from('foods').upload(path, buffer)
  → dapat publicUrl → simpan ke kolom imageUrl di DB
  → imageKey disimpan di DB untuk keperluan hapus file
  → saat hapus produk → supabase.storage.from('foods').remove([imageKey])
```

---

## Testing

- **Unit tests** — AppError, pagination, jwt utils
- **Integration tests** — semua endpoint via Supertest
- Database test terpisah (`DATABASE_URL_TEST`) di Supabase
- `--runInBand` untuk mencegah race condition antar test suite
- `beforeAll` pakai `upsert` untuk data test — mencegah unique constraint error di CI
- Rate limiter & cache middleware otomatis skip saat `NODE_ENV === 'test'`

```
Tests: 69 passed (12 unit + 57 integration)
```

---

## CI/CD (GitHub Actions)

**Trigger:** Pull Request ke `main`

**Pipeline:**
```
install dependencies (npm ci)
  → run Prisma migrations (DATABASE_URL_TEST)
  → run tests (NODE_ENV=test)
```

**Env:** semua via GitHub Secrets, Upstash env di-set di level job supaya tersedia saat module initialization.

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
DATABASE_URL_TEST=postgresql://...   # database terpisah untuk testing
DIRECT_URL_TEST=postgresql://...

# Supabase (untuk Storage)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_...   # pakai Secret key, bukan Publishable key

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx
```

---

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "prisma": "^5.x",
    "@prisma/client": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "@upstash/redis": "^x.x",
    "@upstash/ratelimit": "^x.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "cookie-parser": "^1.x",
    "zod": "^3.x",
    "multer": "^1.x",
    "swagger-ui-express": "^5.x",
    "swagger-jsdoc": "^6.x",
    "dotenv": "^16.x",
    "cors": "^2.x",
    "helmet": "^7.x"
  },
  "devDependencies": {
    "nodemon": "^3.x",
    "jest": "^29.x",
    "supertest": "^6.x",
    "cross-env": "^7.x"
  }
}
```

> `crypto` tidak perlu diinstall — sudah built-in di Node.js. Dipakai untuk hash refresh token sebelum disimpan ke DB.