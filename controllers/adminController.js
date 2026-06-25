const User = require('../models/User');
const Ticket = require('../models/Ticket');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user role (Make Admin/Vendor)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark vendor as fraud (Suspends vendor and hides all their tickets)
// @route   PUT /api/admin/users/:id/fraud
// @access  Private/Admin
exports.markVendorAsFraud = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'vendor') {
      return res.status(400).json({ success: false, message: 'Only vendors can be marked as fraud' });
    }

    // Set status to fraud
    user.status = 'fraud';
    await user.save();

    // Fraud rule: Hide all vendor tickets (update verificationStatus to rejected)
    await Ticket.updateMany(
      { vendor: user._id },
      { verificationStatus: 'rejected', isAdvertised: false }
    );

    res.json({
      success: true,
      message: 'Vendor flagged as FRAUD. All listed tickets have been rejected and hidden.',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
