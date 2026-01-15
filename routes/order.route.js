const express = require("express");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const authenticatedUser = require("../Authentication/auth");

const router = express.Router();

/* CHECKOUT */
router.post("/checkout", authenticatedUser, async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const order = await Order.create({
    user: req.user.id,
    items: cart.items,
    shippingAddress,
    paymentMethod,
    totalAmount: cart.totalPrice,
  });

  // clear cart after order
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({
    message: "Order placed successfully",
    order,
  });
});

//get all orders
router.get("/my-orders", authenticatedUser, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.product", "name images");

  res.json(orders);
});

//get single order

router.get("/:orderId", authenticatedUser, async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user.id,
  }).populate("items.product");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
});

router.get("/", authenticatedUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



//check order status
router.put("/admin/update-status/:id", authenticatedUser, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied" });
  }

  const { orderStatus } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus },
    { new: true }
  );

  res.json(order);
});


module.exports = router;
