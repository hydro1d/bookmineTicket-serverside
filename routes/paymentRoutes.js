const express = require('express');
const router = express.Router();
const { createPaymentIntent, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/create-checkout-session', createPaymentIntent);
router.post('/verify', verifyPayment);

module.exports = router;
