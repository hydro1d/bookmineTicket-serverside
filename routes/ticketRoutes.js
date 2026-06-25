const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getVendorTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getAdminAllTickets,
  updateTicketStatus,
  toggleAdvertiseTicket,
  getAdvertisedTickets
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getTickets);
router.get('/advertised', getAdvertisedTickets);
router.get('/all-vendor', protect, authorize('vendor'), getVendorTickets);
router.get('/admin-all', protect, authorize('admin'), getAdminAllTickets);
router.get('/:id', getTicketById);

router.post('/', protect, authorize('vendor'), createTicket);
router.put('/:id', protect, authorize('vendor', 'admin'), updateTicket);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteTicket);

router.put('/:id/status', protect, authorize('admin'), updateTicketStatus);
router.put('/:id/advertise', protect, authorize('admin'), toggleAdvertiseTicket);

module.exports = router;
