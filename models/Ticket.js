const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a ticket title'],
    trim: true
  },
  from: {
    type: String,
    required: [true, 'Please specify departure city'],
    trim: true
  },
  to: {
    type: String,
    required: [true, 'Please specify destination city'],
    trim: true
  },
  transportType: {
    type: String,
    enum: ['bus', 'train', 'flight', 'ferry'],
    required: [true, 'Please select transport type']
  },
  price: {
    type: Number,
    required: [true, 'Please specify ticket price']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify quantity of tickets']
  },
  departureTime: {
    type: Date,
    required: [true, 'Please specify departure date and time']
  },
  perks: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=500'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isAdvertised: {
    type: Boolean,
    default: false
  },
  seats: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ticket', TicketSchema);
