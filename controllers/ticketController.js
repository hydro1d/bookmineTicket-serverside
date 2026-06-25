const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Create a ticket
// @route   POST /api/tickets
// @access  Private/Vendor
exports.createTicket = async (req, res) => {
  try {
    const { title, from, to, transportType, price, quantity, departureTime, perks, image } = req.body;

    const vendorId = req.user.id;
    const vendor = await User.findById(vendorId);

    if (vendor.status === 'fraud') {
      return res.status(403).json({ success: false, message: 'Fraud vendors cannot list new tickets' });
    }

    const ticket = await Ticket.create({
      title,
      from,
      to,
      transportType,
      price,
      quantity,
      departureTime,
      perks,
      image,
      vendor: vendorId
    });

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get approved tickets with search, filters, sort, paginate
// @route   GET /api/tickets
// @access  Public
exports.getTickets = async (req, res) => {
  try {
    const { from, to, transportType, sort, page = 1, limit = 6 } = req.query;

    const query = { verificationStatus: 'approved' };

    if (from) {
      query.from = { $regex: from, $options: 'i' };
    }
    if (to) {
      query.to = { $regex: to, $options: 'i' };
    }
    if (transportType) {
      query.transportType = transportType;
    }

    const fraudVendors = await User.find({ status: 'fraud' }).select('_id');
    const fraudIds = fraudVendors.map(v => v._id);
    query.vendor = { $nin: fraudIds };

    let sortQuery = { createdAt: -1 };
    if (sort === 'low-to-high') {
      sortQuery = { price: 1 };
    } else if (sort === 'high-to-low') {
      sortQuery = { price: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tickets = await Ticket.find(query)
      .populate('vendor', 'name email status')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      count: tickets.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tickets added by current logged-in vendor
// @route   GET /api/tickets/all-vendor
// @access  Private/Vendor
exports.getVendorTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ vendor: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ticket detail
// @route   GET /api/tickets/:id
// @access  Public
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('vendor', 'name email status');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket details (resets status to pending)
// @route   PUT /api/tickets/:id
// @access  Private/Vendor
exports.updateTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Ensure user is the ticket owner (vendor)
    if (ticket.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this ticket' });
    }

    if (ticket.verificationStatus === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot edit a rejected ticket' });
    }

    const fieldsToUpdate = { ...req.body, verificationStatus: 'pending' };
    delete fieldsToUpdate.vendor; // Readonly protection

    ticket = await Ticket.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Vendor
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this ticket' });
    }

    if (ticket.verificationStatus === 'rejected') {
      return res.status(400).json({ success: false, message: 'Cannot delete a rejected ticket' });
    }

    await ticket.deleteOne();

    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
