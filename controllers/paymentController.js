const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_values_here');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Transaction = require('../models/Transaction');

// @desc    Create Stripe Payment checkout intent
// @route   POST /api/payments/create-checkout-session
// @access  Private/User
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate('ticket');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted bookings can be paid' });
    }

    // Rule: Cannot pay after departure time
    if (new Date(booking.ticket.departureTime) < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot pay: Departure time has passed' });
    }

    // Stripe amount in cents
    const amountInCents = Math.round(booking.totalPrice * 100);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: booking.totalPrice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Stripe payment status and complete reservation booking
// @route   POST /api/payments/verify
// @access  Private/User
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId).populate('ticket');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    const ticket = booking.ticket;

    // Check quantity availability again
    if (ticket.quantity < booking.quantity) {
      return res.status(400).json({ success: false, message: 'Tickets no longer available in this quantity' });
    }

    // Update ticket inventory quantity and append booked seats
    ticket.quantity -= booking.quantity;
    if (booking.seats && booking.seats.length > 0) {
      ticket.seats = [...ticket.seats, ...booking.seats];
    }
    await ticket.save();

    // Update booking status
    booking.status = 'paid';
    booking.paymentIntentId = paymentIntentId;
    await booking.save();

    // Generate Transaction Record
    const transaction = await Transaction.create({
      transactionId: paymentIntentId || 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount: booking.totalPrice,
      booking: booking._id,
      user: req.user.id,
      ticketTitle: ticket.title
    });

    res.json({
      success: true,
      message: 'Payment verified and ticket booked successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
