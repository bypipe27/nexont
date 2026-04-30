const router = require('express').Router();
const multer = require('multer');
const productsController = require('./products.controller');
const { validateCreateProduct, validateUpdateProduct } = require('./products.validation');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');

// ─── Configuración de multer ──────────────────────────────────────────────────
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Rutas públicas ───────────────────────────────────────────────────────────

// GET /api/v1/products — Listar todos los productos activos
router.get('/', productsController.getProducts);

// GET /api/v1/products/recent — Últimas 6 publicaciones para la home (PÚBLICO)
// DEBE ir ANTES de /:id para no ser capturado por el param
router.get('/recent', productsController.getRecentProducts);

// GET /api/v1/products/my — Productos del vendedor autenticado
router.get('/my', authMiddleware, productsController.getMyProducts);

// GET /api/v1/products/:id — Obtener producto por ID
router.get('/:id', productsController.getProductById);

// POST /api/v1/products — Publicar nuevo producto (solo autenticados)
router.post('/', authMiddleware, upload.single('imagen'), validateCreateProduct, productsController.createProduct);

// PUT /api/v1/products/:id — Actualizar producto (solo el vendedor)
router.put('/:id', authMiddleware, upload.single('imagen'), validateUpdateProduct, productsController.updateProduct);

// DELETE /api/v1/products/:id — Eliminar producto
router.delete('/:id', authMiddleware, productsController.deleteProduct);

module.exports = router;