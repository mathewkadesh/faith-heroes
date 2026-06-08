const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { imageUpload } = require('../middleware/upload');
const ctrl = require('../controllers/signatureItems.controller');

// Public routes. Keep specific paths before /:characterId.
router.get('/item/:itemId', ctrl.getOne);

// Admin routes. Keep specific paths before /:characterId and /:itemId actions.
router.get('/admin/:characterId', auth, adminOnly, ctrl.getByCharacterAdmin);
router.patch('/reorder', auth, adminOnly, ctrl.reorder);
router.post('/', auth, adminOnly, ctrl.create);
router.put('/:itemId', auth, adminOnly, ctrl.update);
router.delete('/:itemId', auth, adminOnly, ctrl.remove);
router.patch('/:itemId/toggle', auth, adminOnly, ctrl.toggleActive);
router.post('/:itemId/image', auth, adminOnly, imageUpload.single('file'), ctrl.uploadImage);
router.patch('/:itemId/stock', auth, adminOnly, ctrl.updateStock);

// Public character route last so it does not shadow /item, /admin, or /reorder.
router.get('/:characterId', ctrl.getByCharacter);

module.exports = router;
