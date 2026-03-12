const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const productsController = require('./products.controller');
const { validateCreateProduct, validateUpdateProduct } = require('./products.validation');

// ─── Configuración de multer ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products'); // carpeta donde se guardan las imágenes
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

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

// GET /api/v1/products — Listar todos los productos activos
router.get('/', productsController.getProducts);

// GET /api/v1/products/my — Listar productos del vendedor autenticado  // <-- NUEVO
router.get('/my', productsController.getMyProducts);

// GET /api/v1/products/:id — Obtener producto por ID
router.get('/:id', productsController.getProductById);

// POST /api/v1/products — Publicar nuevo producto (solo autenticados)
router.post('/', upload.single('image'), validateCreateProduct, productsController.createProduct); // <-- MODIFICADO

// PUT /api/v1/products/:id — Actualizar producto (solo el vendedor)
router.put('/:id', validateUpdateProduct, productsController.updateProduct);

// DELETE /api/v1/products/:id — Eliminar producto (solo el vendedor)
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
