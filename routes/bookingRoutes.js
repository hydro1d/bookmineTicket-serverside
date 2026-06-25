const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getVendorBookings,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // Secure all booking actions

router.post('/', authorize('user'), createBooking);
router.get('/user-bookings', authorize('user'), getUserBookings);
router.get('/vendor-bookings', authorize('vendor'), getVendorBookings);
router.put('/:id/status', authorize('vendor'), updateBookingStatus);
router.delete('/:id', authorize('user'), cancelBooking);

module.exports = router;
