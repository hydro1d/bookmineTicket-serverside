const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get Vendor Revenue and ticket performance stats
// @route   GET /api/dashboard/vendor
// @access  Private/Vendor
exports.getVendorStats = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Total tickets added
    const totalTicketsAdded = await Ticket.countDocuments({ vendor: vendorId });

    // Tickets status list
    const tickets = await Ticket.find({ vendor: vendorId }).select('_id');
    const ticketIds = tickets.map(t => t._id);

    // Bookings requested and sold
    const bookings = await Booking.find({ ticket: { $in: ticketIds } });
    
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    bookings.forEach(b => {
      if (b.status === 'paid') {
        totalTicketsSold += b.quantity;
        totalRevenue += b.totalPrice;
      }
    });

    // Generate monthly sales metrics using booking data
    const monthlySales = [
      { name: 'Jan', sales: 0, revenue: 0 },
      { name: 'Feb', sales: 0, revenue: 0 },
      { name: 'Mar', sales: 0, revenue: 0 },
      { name: 'Apr', sales: 0, revenue: 0 },
      { name: 'May', sales: 0, revenue: 0 },
      { name: 'Jun', sales: 0, revenue: 0 },
      { name: 'Jul', sales: 0, revenue: 0 },
      { name: 'Aug', sales: 0, revenue: 0 },
      { name: 'Sep', sales: 0, revenue: 0 },
      { name: 'Oct', sales: 0, revenue: 0 },
      { name: 'Nov', sales: 0, revenue: 0 },
      { name: 'Dec', sales: 0, revenue: 0 }
    ];

    bookings.forEach(b => {
      if (b.status === 'paid') {
        const monthIndex = new Date(b.createdAt).getMonth();
        monthlySales[monthIndex].sales += b.quantity;
        monthlySales[monthIndex].revenue += b.totalPrice;
      }
    });

    res.json({
      success: true,
      stats: {
        totalTicketsAdded,
        totalTicketsSold,
        totalRevenue,
        monthlySales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin platform level summary stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTickets = await Ticket.countDocuments({});
    const totalTransactions = await Transaction.countDocuments({});
    
    const transactions = await Transaction.find({});
    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTickets,
        totalTransactions,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
