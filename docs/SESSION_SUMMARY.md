## Yang Dikerjakan di Chat Ini

### Session 5 — Categories & Foods ✅
File yang dibuat:
- `src/config/supabase.js`
- `src/middlewares/upload.js`
- `src/validators/foodValidator.js`
- `src/repositories/categoryRepository.js`
- `src/services/categoryService.js`
- `src/controllers/categoryController.js`
- `src/routes/categoryRoutes.js`
- `src/repositories/foodRepository.js`
- `src/services/foodService.js`
- `src/controllers/foodController.js`
- `src/routes/foodRoutes.js`
- Update `src/routes/index.js`

Bug yang ditemukan & diperbaiki:
- Import middleware salah — harusnya `authMiddleware` dan `roleMiddleware`, bukan `protect` dan `adminOnly`

### Session 6 — Cart ✅
File yang dibuat:
- `src/validators/cartValidator.js`
- `src/repositories/cartRepository.js`
- `src/services/cartService.js`
- `src/controllers/cartController.js`
- `src/routes/cartRoutes.js`
- Update `src/routes/index.js`

Keputusan bisnis baru:
- Update quantity 0 = otomatis hapus item dari cart (auto-delete)
- Duplicate item di cart = quantity di-increment, bukan buat item baru

### Session 7 — Orders ✅
File yang dibuat:
- `src/validators/orderValidator.js`
- `src/repositories/orderRepository.js`
- `src/services/orderService.js`
- `src/controllers/orderController.js`
- `src/routes/orderRoutes.js`
- Update `src/routes/index.js`

Bug yang ditemukan & diperbaiki:
- Route `/admin/orders` dipindah dari `orderRoutes.js` ke `routes/index.js` supaya URL-nya jadi `/api/v1/admin/orders` sesuai PRD

---

## Keputusan Teknis Baru di Chat Ini

| Hal | Keputusan |
|-----|-----------|
| Middleware auth | Export named: `authMiddleware` (bukan `protect`) |
| Middleware role | Export named: `roleMiddleware` (bukan `adminOnly`) |
| isAvailable | Manual — support pre-order, tidak otomatis false saat stock 0 |
| Cart auto-create | Cart dibuat otomatis saat user pertama kali tambah item |
| Update quantity 0 | Otomatis hapus item dari cart |
| Duplicate cart item | Quantity di-increment |
| priceAtOrder | Snapshot harga saat checkout, bukan harga sekarang |
| Checkout transaksi | Semua operasi dalam satu `prisma.$transaction` |
| Admin orders route | Di-mount di `routes/index.js`, bukan di `orderRoutes.js` |

---

## Hal-hal yang Dipelajari di Chat Ini

- **Bucket Supabase** — container untuk menyimpan file, harus dibuat manual di dashboard
- **`include` Prisma** — setara `populate` di Mongoose, pakai relasi dari schema
- **`{ data: publicUrlData }`** — rename saat destructuring
- **`coerce` di Zod** — paksa konversi tipe data sebelum validasi
- **`take` vs `limit`** — Prisma pakai `take`, fungsinya sama dengan SQL `LIMIT`
- **`Promise.all`** — jalankan dua query paralel sekaligus
- **`prisma.$transaction`** — semua operasi atomic, kalau satu gagal semua rollback
- **Nested write Prisma** — buat Order + OrderItems sekaligus, `orderId` otomatis terhubung
- **`tx`** — transaction client dari Prisma, sama seperti `prisma` tapi terikat transaksi

---

## Status Sekarang
Selesai sampai Session 7. Siap lanjut ke **Session 8 — Polish:**
- Rate limiting
- Swagger docs
- Test semua endpoint

---