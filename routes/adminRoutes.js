const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, markVendorAsFraud } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin')); // Secure entire router for admin only

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/fraud', markVendorAsFraud);

module.exports = router;
