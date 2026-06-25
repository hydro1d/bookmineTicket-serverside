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

    // Search by From and To
    if (from) {
      query.from = { $regex: from, $options: 'i' };
    }
    if (to) {
      query.to = { $regex: to, $options: 'i' };
    }
    // Filter by transportType
    if (transportType) {
      query.transportType = transportType;
    }

    // Hide tickets from fraud vendors
    const fraudVendors = await User.find({ status: 'fraud' }).select('_id');
    const fraudIds = fraudVendors.map(v => v._id);
    query.vendor = { $nin: fraudIds };

    // Sorting
    let sortQuery = { createdAt: -1 };
    if (sort === 'low-to-high') {
      sortQuery = { price: 1 };
    } else if (sort === 'high-to-low') {
      sortQuery = { price: -1 };
    }

    // Pagination
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
