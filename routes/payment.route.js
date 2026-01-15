const express = require("express");
const razorpay = require("../config/razorpay");
const authenticatedUser = require("../Authentication/auth");
const Order = require("../models/order.model");
const crypto = require("crypto");

const router = express.Router();

router.post("/create-order", authenticatedUser, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      orderId: razorpayOrder.id,
    });

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error });
  }
});


router.post("/verify", authenticatedUser, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        status: "paid",
      }
    );

    res.json({ message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed", error });
  }
});


module.exports = router;
