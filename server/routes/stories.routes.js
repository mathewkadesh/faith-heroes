const router = require('express').Router();
const auth      = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const ctrl      = require('../controllers/stories.controller');

router.get('/',                ctrl.getApproved);
router.post('/',               auth, ctrl.submit);
router.get('/pending',         auth, adminOnly, ctrl.getPending);
router.patch('/:id/approve',   auth, adminOnly, ctrl.approve);
router.patch('/:id/reject',    auth, adminOnly, ctrl.reject);

module.exports = router;
