const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

// @desc    Create a ticket booking
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = async (req, res) => {
  try {
    const { ticketId, quantity, seats } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (new Date(ticket.departureTime) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot book: Departure time has passed' });
    }

    if (ticket.quantity === 0) {
      return res.status(400).json({ success: false, message: 'Ticket is sold out' });
    }

    if (quantity > ticket.quantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot book more than ${ticket.quantity} available tickets`
      });
    }

    const totalPrice = ticket.price * quantity;

    const booking = await Booking.create({
      user: req.user.id,
      ticket: ticketId,
      quantity,
      totalPrice,
      seats: seats || [],
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings of logged-in user
// @route   GET /api/bookings/user-bookings
// @access  Private/User
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'ticket',
        populate: { path: 'vendor', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings requested for vendor's tickets
// @route   GET /api/bookings/vendor-bookings
// @access  Private/Vendor
exports.getVendorBookings = async (req, res) => {
  try {
    // Find all tickets belonging to this vendor
    const vendorTickets = await Ticket.find({ vendor: req.user.id }).select('_id');
    const ticketIds = vendorTickets.map(t => t._id);

    const bookings = await Booking.find({ ticket: { $in: ticketIds } })
      .populate('user', 'name email')
      .populate('ticket')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vendor accepts/rejects a booking request
// @route   PUT /api/bookings/:id/status
// @access  Private/Vendor
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted, rejected
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status type' });
    }

    const booking = await Booking.findById(req.params.id).populate('ticket');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify vendor ownership
    if (booking.ticket.vendor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to change status' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    User cancels booking before vendor accepts
// @route   DELETE /api/bookings/:id
// @access  Private/User
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel booking' });
    }

    // Rule: Booking can only be cancelled if status is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be cancelled'
      });
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
