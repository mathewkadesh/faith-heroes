const router = require('express').Router();
const auth      = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const ctrl      = require('../controllers/admin.controller');

router.get('/stats',              auth, adminOnly, ctrl.getStats);
router.get('/revenue',            auth, adminOnly, ctrl.getRevenue);
router.get('/customers',          auth, adminOnly, ctrl.getCustomers);
router.patch('/customers/:id/role', auth, adminOnly, ctrl.updateRole);
router.get('/messages',           auth, adminOnly, ctrl.getMessages);
router.patch('/messages/:id/read', auth, adminOnly, ctrl.markRead);

module.exports = router;
