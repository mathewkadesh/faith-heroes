const router = require('express').Router();
const auth      = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const ctrl      = require('../controllers/orders.controller');

router.get('/track/:orderNumber',    ctrl.trackByNumber);
router.get('/email/:email',          ctrl.trackByEmail);
router.get('/my',                    auth, ctrl.getMyOrders);
router.get('/',                      auth, adminOnly, ctrl.getAll);
router.get('/:id',                   auth, ctrl.getOne);
router.post('/',                     auth, ctrl.create);
router.patch('/:id/status',          auth, adminOnly, ctrl.updateStatus);
router.patch('/:id/tracking',        auth, adminOnly, ctrl.addTracking);
router.post('/:id/refund',           auth, adminOnly, ctrl.refund);

module.exports = router;
