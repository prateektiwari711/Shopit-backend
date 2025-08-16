import express from "express";
import nodemailer from "nodemailer";
import authenticateToken from "../middleware/auth.js";
import Stock from "../models/Stock.js";
import Seller from "../models/Seller.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { sellerId, items } = req.body;

    if (!sellerId || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Seller ID and items are required" });
    }

    const seller = await Seller.findOne({ _id: sellerId, user: req.user._id });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const stockItems = await Stock.find({
      user: req.user._id,
      _id: { $in: items.map((i) => i._id) },
    });

    if (stockItems.length !== items.length) {
      return res.status(400).json({ message: "One or more items are invalid" });
    }

    const orderDetails = items
      .map((item) => `${item.itemName} - Qty: ${item.quantity}`)
      .join("\n");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: seller.email,
      subject: `New Order Request - ${seller.name}`,
      text: `Hello ${seller.name},\n\nPlease supply the following items:\n\n${orderDetails}\n\nShip to: ${seller.siteAddress}\n\nThank you,\nShopIt`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Order placed and email sent successfully",
    });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
});

export default router;
