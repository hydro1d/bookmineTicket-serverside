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

    // Validation: Departure time passed
    if (new Date(ticket.departureTime) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot book: Departure time has passed' });
    }

    // Validation: Quantity = 0 or exceeds available
    if (ticket.quantity === 0) {
      return res.status(400).json({ success: false, message: 'Ticket is sold out' });
    }

    if (quantity > ticket.quantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot book more than ${ticket.quantity} available tickets`
      });
    }

    // Calculate total price
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
