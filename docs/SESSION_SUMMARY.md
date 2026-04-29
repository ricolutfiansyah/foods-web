tolong baca dulu docs/SESSION_SUMMARY.md, 
ini berisi ringkasan dari session yang sudah saya kerjakan sebelumnya, buat sebagai pengingat saja. Selanjutnya kita akan lanjut ke session berikutnya.

Kamu adalah senior backend developer Node.js yang berpengalaman.
Kamu selalu mengikuti konvensi dan arsitektur yang sudah ditentukan.
Jika ada keputusan teknis yang belum ditentukan, tanya dulu sebelum eksekusi.

Baca file-file berikut di folder docs/:
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/PROGRESS.md

Project ini menggunakan ES Module (import/export), bukan CommonJS.
Semua file harus pakai import/export dan sertakan ekstensi .js saat import file lokal.

Sekarang kerjakan Task Session 5 — Categories & Foods:

1. src/config/supabase.js
   - Inisialisasi Supabase client menggunakan SUPABASE_URL dan SUPABASE_SERVICE_KEY dari .env
   - Export sebagai default

2. src/middlewares/upload.js
   - Gunakan multer dengan memoryStorage() — file tidak disimpan ke disk
   - Hanya izinkan file image/jpeg, image/png, image/webp
   - Maksimal ukuran file: 2MB
   - Jika tipe file tidak valid, throw AppError 400
   - Export sebagai default

3. src/validators/foodValidator.js
   - Zod schema createFoodSchema:
     - name: string, required
     - description: string, optional
     - price: number, positif
     - stock: integer, minimal 0
     - categoryId: string uuid
     - isAvailable: boolean, optional (default true)
   - Zod schema updateFoodSchema: semua field optional kecuali aturan tipe tetap sama

4. src/repositories/categoryRepository.js
   - findAll() — ambil semua kategori, urutkan by name asc
   - findById(id)
   - findBySlug(slug)
   - create(data) — data: { name, slug }
   - update(id, data)
   - delete(id)

5. src/services/categoryService.js
   - getAllCategories()
   - getCategoryById(id) — throw AppError 404 jika tidak ada
   - createCategory(data)
     - generate slug dari name (lowercase, spasi → tanda hubung)
     - cek slug belum dipakai, throw AppError 409 jika sudah ada
   - updateCategory(id, data)
     - regenerate slug jika name berubah
     - cek slug belum dipakai oleh kategori lain
   - deleteCategory(id)
     - throw AppError 404 jika tidak ada

6. src/controllers/categoryController.js
   - getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory
   - Semua dibungkus asyncHandler
   - Gunakan sendResponse dari utils/response.js

7. src/routes/categoryRoutes.js
   - GET / → getAllCategories (guest)
   - GET /:id → getCategoryById (guest)
   - POST / → protect, adminOnly, createCategory
   - PATCH /:id → protect, adminOnly, updateCategory
   - DELETE /:id → protect, adminOnly, deleteCategory

8. src/repositories/foodRepository.js
   - findAll({ page, limit, search, categoryId, isAvailable })
     - search: filter by name (contains, case-insensitive)
     - categoryId: filter by kategori
     - isAvailable: filter by status
     - return { data, total } untuk pagination
   - findById(id) — include category
   - create(data)
   - update(id, data)
   - delete(id)

9. src/services/foodService.js
   - getAllFoods(query) — gunakan getPaginationParams dari utils/pagination.js
   - getFoodById(id) — throw AppError 404 jika tidak ada
   - createFood(data, file)
     - jika ada file: upload ke Supabase Storage bucket 'foods'
     - filename: foods/{uuid}-{originalname}
     - simpan imageUrl dan imageKey ke data
   - updateFood(id, data, file)
     - jika ada file baru: hapus gambar lama dari Storage (gunakan imageKey), upload gambar baru
   - deleteFood(id)
     - hapus gambar dari Storage jika ada imageKey
     - hapus data dari DB

10. src/controllers/foodController.js
    - getAllFoods, getFoodById, createFood, updateFood, deleteFood
    - Semua dibungkus asyncHandler
    - createFood dan updateFood gunakan upload.single('image') sebagai middleware
    - Gunakan sendResponse dari utils/response.js

11. src/routes/foodRoutes.js
    - GET / → getAllFoods (guest)
    - GET /:id → getFoodById (guest)
    - POST / → protect, adminOnly, upload.single('image'), createFood
    - PATCH /:id → protect, adminOnly, upload.single('image'), updateFood
    - DELETE /:id → protect, adminOnly, deleteFood

12. Update src/routes/index.js
    - Mount categoryRoutes ke /api/v1/categories
    - Mount foodRoutes ke /api/v1/foods

Aturan wajib:
- Gunakan ES Module (import/export)
- Gunakan asyncHandler di semua controller
- Gunakan AppError untuk semua error yang diketahui
- Gunakan sendResponse dan sendError dari utils/response.js
- Gunakan getPaginationParams dari utils/pagination.js untuk endpoint list
- Gunakan protect dari middlewares/authMiddleware.js
- Gunakan adminOnly dari middlewares/roleMiddleware.js
- Jangan buat file di luar scope task
- Kalau ada yang tidak jelas, tanya dulu