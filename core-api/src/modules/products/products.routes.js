const router = require('express').Router();
const productsController = require('./products.controller');
const { validateCreateProduct, validateUpdateProduct } = require('./products.validation');

// GET /api/v1/products — Listar todos los productos activos
router.get('/', productsController.getProducts);

// GET /api/v1/products/:id — Obtener producto por ID
router.get('/:id', productsController.getProductById);

// POST /api/v1/products — Publicar nuevo producto (solo autenticados)
router.post('/', validateCreateProduct, productsController.createProduct);

// PUT /api/v1/products/:id — Actualizar producto (solo el vendedor)
router.put('/:id', validateUpdateProduct, productsController.updateProduct);

// DELETE /api/v1/products/:id — Eliminar producto (solo el vendedor)
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
