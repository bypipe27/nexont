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

// FileFilter for verification document upload: only jpg/png per requirement N27
const docsFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes JPG o PNG'));
};
const docsUpload = multer({ storage, fileFilter: docsFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/v1/users/me
router.get('/me', usersController.getMe);

// GET /api/v1/users/me/dashboard
router.get('/me/dashboard', usersController.getSellerDashboard);

// PUT /api/v1/users/me
router.put('/me', upload.single('fotoPerfil'), usersController.updateMe);

// Verification endpoints (simulated)
router.post('/me/verification', usersController.submitVerification);
router.get('/me/verification', usersController.getVerification);
// POST /api/v1/users/me/documents - upload cedula and personal photo
router.post('/me/documents', docsUpload.fields([
  { name: 'documentoIdentidad', maxCount: 1 },
  { name: 'fotoPersonal', maxCount: 1 },
]), usersController.uploadDocuments);

// POST /api/v1/users/me/verification/form - save verification form data
router.post('/me/verification/form', usersController.submitVerificationForm);

module.exports = router;