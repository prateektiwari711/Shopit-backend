import express from "express";
import authenticateToken from "../middleware/auth.js";
import Seller from "../models/Seller.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  const { name, email, siteAddress } = req.body;

  if (!name || !email || !siteAddress) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const seller = new Seller({
      user: req.user,
      name,
      email,
      siteAddress,
    });
    await seller.save();
    res.status(201).json(seller);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const sellers = await Seller.find({ user: req.user });
    res.json(sellers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const seller = await Seller.findOne({ _id: req.params.id, user: req.user });
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json(seller);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
