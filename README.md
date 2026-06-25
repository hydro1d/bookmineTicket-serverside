# TicketBari MERN Server-Side

Backend server API for TicketBari Booking Platform, implementing Express.js routing, MongoDB collections, JWT auth protection, role authorization, and Stripe payment gateway.

## Features
- **JWT Auth Middleware**: Route security and session verification.
- **Mongoose Data Schemas**: Full validation for Users, Tickets, Bookings and Transactions.
- **Stripe Payments**: Checkout intent generation and verification of payments.
- **Vendor Revenue Metrics**: Sales metrics aggregation for Recharts UI display.
- **Fraud Rules**: Suspends vendor account and rejects all listed tickets instantly.
