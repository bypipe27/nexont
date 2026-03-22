const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const productsController = require('./products.controller');
const { validateCreateProduct, validateUpdateProduct } = require('./products.validation');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');

// ─── Configuración de multer (solo validación, sin almacenamiento local) ──────
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB máx

// ─── Rutas ────────────────────────────────────────────────────────────────────

// GET /api/v1/products — Listar todos los productos activos (PÚBLICO)
router.get('/', productsController.getProducts);

// GET /api/v1/products/my — Listar productos del vendedor autenticado (PRIVADO)
// Debe ir ANTES de /:id porque es más específico
router.get('/my', authMiddleware, productsController.getMyProducts);

// GET /api/v1/products/:id — Obtener producto por ID (PÚBLICO)
router.get('/:id', productsController.getProductById);

// POST /api/v1/products — Publicar nuevo producto (solo autenticados) // <-- NUEVO
router.post('/', authMiddleware, upload.single('imagen'), validateCreateProduct, productsController.createProduct);

// PUT /api/v1/products/:id — Actualizar producto (solo el vendedor)
router.put('/:id', authMiddleware, upload.single('imagen'), validateUpdateProduct, productsController.updateProduct);

// DELETE /api/v1/products/:id — Eliminar producto (solo el vendedor)
router.delete('/:id', authMiddleware, productsController.deleteProduct);

module.exports = router;
