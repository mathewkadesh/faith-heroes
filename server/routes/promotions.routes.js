const router = require('express').Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { imageUpload } = require('../middleware/upload');
const ctrl = require('../controllers/promotions.controller');

// Specific routes must stay before /:slug.
router.get('/featured/now', ctrl.getFeatured);
router.post('/validate-code', ctrl.validateCode);
router.get('/admin/all', auth, adminOnly, ctrl.getAll);

router.get('/', ctrl.getActive);
router.post('/', auth, adminOnly, ctrl.create);
router.get('/:id/items', auth, adminOnly, ctrl.getItems);
router.post('/:id/items', auth, adminOnly, ctrl.createItem);
router.put('/items/:itemId', auth, adminOnly, ctrl.updateItem);
router.delete('/items/:itemId', auth, adminOnly, ctrl.removeItem);
router.post('/items/:itemId/image', auth, adminOnly, imageUpload.single('file'), ctrl.uploadItemImage);
router.put('/:id', auth, adminOnly, ctrl.update);
router.patch('/:id/toggle', auth, adminOnly, ctrl.toggle);
router.post('/:id/banner', auth, adminOnly, imageUpload.single('file'), ctrl.uploadBanner);
router.delete('/:id', auth, adminOnly, ctrl.remove);

router.get('/:slug', ctrl.getBySlug);

module.exports = router;
