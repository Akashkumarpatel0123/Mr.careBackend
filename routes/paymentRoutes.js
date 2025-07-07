const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
require('dotenv').config();

// Razorpay Instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order for Online Payment
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const order = await razorpayInstance.orders.create({
      amount: parseInt(amount) * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Cash on Delivery Booking Handler (Optional)
router.post('/cod-order', async (req, res) => {
  try {
    const { nurse, service, amount } = req.body;

    // You can store this booking in the database here

    console.log('COD Booking Received:', {
      nurse,
      service,
      amount,
    });

    res.status(200).json({ success: true, message: 'COD booking confirmed' });
  } catch (err) {
    console.error('COD Booking Failed:', err);
    res.status(500).json({ success: false, error: 'COD booking failed' });
  }
});

module.exports = router;
