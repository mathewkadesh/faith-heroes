const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

router.get('/me', auth, ctrl.getMe);

module.exports = router;
