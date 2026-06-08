const multer = require('multer');

const storage = multer.memoryStorage();

const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

const modelUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.originalname.endsWith('.glb') || file.originalname.endsWith('.gltf');
    if (ok) cb(null, true);
    else cb(new Error('Only .glb or .gltf files allowed'));
  },
});

module.exports = { imageUpload, modelUpload };
