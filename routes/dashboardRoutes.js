const express = require('express');
const router = express.Router();
const { getVendorStats, getAdminStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/vendor', authorize('vendor'), getVendorStats);
router.get('/admin', authorize('admin'), getAdminStats);

module.exports = router;
