const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/payments.controller');

router.post('/create-session',  auth, ctrl.createStripeSession);
router.post('/stripe-session',  auth, ctrl.createStripeSession);
router.post('/webhook',               ctrl.stripeWebhook);  // raw body — no json middleware

module.exports = router;
