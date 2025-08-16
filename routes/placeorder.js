import express from "express";
import Order from "../models/Order.js";
import Seller from "../models/Seller.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/place-order", async (req, res) => {
  console.log("📥 Received request at /place-order");
  console.log("Request body:", req.body);

  const { sellerId, items } = req.body;

  if (!sellerId || !items || items.length === 0) {
    return res.status(400).json({ error: "Seller ID and items are required" });
  }

  try {
    // 🔹 Find seller
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }
    console.log("🔍 Seller found:", seller);

    // 🔹 Get buyer
    const buyer = await User.findById(seller.user);
    if (!buyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }
    console.log("🔍 Buyer found:", buyer);

    // 🔹 Save order
    let newOrder;
    try {
      newOrder = new Order({
        seller: seller._id,
        buyer: buyer._id,
        items,
      });
      await newOrder.save();
      console.log("✅ Order saved:", newOrder);
    } catch (err) {
      console.error("❌ Failed to save order:", err.message);
      return res.status(500).json({ error: "Failed to save order" });
    }

    // 🔹 Setup mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: buyer.email,
      to: seller.email,
      subject: "🛒 New Order Placed",
      html: `
        <h3>New Order from ${buyer.name}</h3>
        <p><strong>Buyer Email:</strong> ${buyer.email}</p>
        <h4>Items Ordered:</h4>
        <ul>
          ${items
            .map((item) => `<li>${item.itemName} (x${item.quantity})</li>`)
            .join("")}
        </ul>
        <p>✅ Please check your dashboard for more details.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📧 Email sent successfully");
    } catch (err) {
      console.error("❌ Failed to send email:", err.message);
      return res
        .status(500)
        .json({ error: "Order placed but failed to send email" });
    }

    // 🔹 Success
    return res.status(200).json({
      success: true,
      message: "Order placed and email sent successfully",
    });
  } catch (err) {
    console.error("❌ General error:", err.message);
    return res.status(500).json({ error: "Failed to place order" });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate("buyer").populate("seller");
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;
