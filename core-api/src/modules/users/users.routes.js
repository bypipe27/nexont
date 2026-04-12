const router = require('express').Router();
const multer = require('multer');
const usersController = require('./users.controller');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/v1/users/me
router.get('/me', usersController.getMe);

// PUT /api/v1/users/me
router.put('/me', upload.single('fotoPerfil'), usersController.updateMe);

module.exports = router;