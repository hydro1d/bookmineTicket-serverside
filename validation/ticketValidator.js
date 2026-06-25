const validateTicketInput = (req, res, next) => {
  const { title, from, to, transportType, price, quantity, departureTime } = req.body;
  
  if (!title || !from || !to || !transportType || !price || !quantity || !departureTime) {
    return res.status(400).json({ success: false, message: 'Please provide all required ticket parameters' });
  }

  if (price <= 0 || quantity < 0) {
    return res.status(400).json({ success: false, message: 'Price and quantity must be positive numeric values' });
  }

  next();
};

module.exports = { validateTicketInput };
