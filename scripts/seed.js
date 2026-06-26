const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

dotenv.config();

const usersData = [
  {
    name: 'Platform Administrator',
    email: 'admin@ticketbari.com',
    password: 'adminpassword123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120'
  },
  {
    name: 'GreenLine Operators',
    email: 'greenline@vendor.com',
    password: 'vendorpassword123',
    role: 'vendor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
  },
  {
    name: 'Premium Airway Vendor',
    email: 'airways@vendor.com',
    password: 'vendorpassword123',
    role: 'vendor',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120'
  },
  {
    name: 'Regular Customer',
    email: 'user@ticketbari.com',
    password: 'userpassword123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
  }
];

const ticketsData = [
  {
    title: 'GreenLine Sleeper Express Bus',
    from: 'Dhaka',
    to: "Cox's Bazar",
    transportType: 'bus',
    price: 1800,
    quantity: 40,
    departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
    perks: ['WiFi', 'AC', 'Mineral Water', 'Sleeper Seat', 'USB Port'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
    verificationStatus: 'approved',
    isAdvertised: true
  },
  {
    title: 'Subarna Express Train',
    from: 'Dhaka',
    to: 'Chittagong',
    transportType: 'train',
    price: 750,
    quantity: 60,
    departureTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days in future
    perks: ['WiFi', 'Snacks', 'AC Cabin', 'Charger Socket'],
    image: 'https://images.unsplash.com/photo-1532103054090-334e6e60ab29?auto=format&fit=crop&q=80&w=600',
    verificationStatus: 'approved',
    isAdvertised: true
  },
  {
    title: 'NovoAir Luxury Flight V4',
    from: 'Dhaka',
    to: 'Sylhet',
    transportType: 'flight',
    price: 4800,
    quantity: 30,
    departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
    perks: ['In-flight Meal', 'Extra Baggage', 'Premium Lounge Access', 'AC'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=600',
    verificationStatus: 'approved',
    isAdvertised: true
  },
  {
    title: 'Saint Martin Cruise Ferry',
    from: "Cox's Bazar",
    to: 'Saint Martin',
    transportType: 'ferry',
    price: 1200,
    quantity: 100,
    departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    perks: ['Sea View Deck', 'AC Lounge', 'Complimentary Buffet'],
    image: 'https://images.unsplash.com/photo-1501446529957-6226bd447c46?auto=format&fit=crop&q=80&w=600',
    verificationStatus: 'approved',
    isAdvertised: true
  },
  {
    title: 'Hanif Enterprise Scania AC',
    from: 'Dhaka',
    to: 'Khulna',
    transportType: 'bus',
    price: 1400,
    quantity: 35,
    departureTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    perks: ['AC', 'USB Charger', 'Reclining Seats'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600',
    verificationStatus: 'approved',
    isAdvertised: true
  },
  {
    title: 'US-Bangla Commuter Flight',
    from: 'Dhaka',
    to: 'Jessore',
    transportType: 'flight',
    price: 4200,
    quantity: 45,
    departureTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    perks: ['WiFi', 'AC', 'Extra Legroom'],
    image: 'https://images.unsplash.com/photo-1473862170180-84427c485ade?auto=format&fit=crop&q=80&w=600',
    verificationStatus: 'approved',
    isAdvertised: true
  },
  {
    title: 'Ena Business Class Bus',
    from: 'Dhaka',
    to: 'Sylhet',
    transportType: 'bus',
    price: 1100,
    quantity: 28,
    departureTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    perks: ['AC', 'Reclining Seats', 'Reading Light'],
    image: 'https://images.unsplash.com/photo-1562620644-87000d603a13?auto=format&fit=crop&q=80&w=600',
    verificationStatus: 'approved',
    isAdvertised: false
  },
  {
    title: 'Parabat Express Intercity',
    from: 'Dhaka',
    to: 'Sylhet',
    transportType: 'train',
    price: 680,
    quantity: 50,
    departureTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    perks: ['Snacks', 'Pantry Car', 'Charger Socket'],
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600',
    verificationStatus: 'approved',
    isAdvertised: false
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketbari');
    console.log('Seed: MongoDB connected...');

    // Clear existing data
    await User.deleteMany();
    await Ticket.deleteMany();

    // Hash passwords manually because insertMany bypasses Mongoose pre-save hooks
    const hashedUsersData = usersData.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10)
    }));

    // Insert Users
    const createdUsers = await User.insertMany(hashedUsersData);
    console.log('Seed: Users seeded.');

    // Fetch the vendor user IDs
    const greenlineVendor = createdUsers.find(u => u.email === 'greenline@vendor.com');
    const airwaysVendor = createdUsers.find(u => u.email === 'airways@vendor.com');

    // Assign vendors to tickets
    const seededTickets = ticketsData.map((ticket, idx) => {
      const vendor = idx % 2 === 0 ? greenlineVendor._id : airwaysVendor._id;
      return { ...ticket, vendor };
    });

    // Insert Tickets
    await Ticket.insertMany(seededTickets);
    console.log('Seed: Tickets seeded successfully.');

    mongoose.disconnect();
    console.log('Seed: Database seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
