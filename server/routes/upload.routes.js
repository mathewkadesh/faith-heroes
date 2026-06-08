const router = require('express').Router();
const { imageUpload, modelUpload } = require('../middleware/upload');
const auth      = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const ctrl      = require('../controllers/upload.controller');

router.post('/image',       auth, adminOnly, imageUpload.single('file'), ctrl.uploadImage);
router.post('/model',       auth, adminOnly, modelUpload.single('file'), ctrl.uploadModel);
router.post('/story-image', auth,            imageUpload.single('file'), ctrl.uploadStoryImage);

module.exports = router;
