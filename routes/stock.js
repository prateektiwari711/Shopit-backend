import express from "express";
import Stock from "../models/Stock.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();
router.post("/add-stock", authenticateToken, async (req, res) => {
  const { itemName, quantity, price } = req.body;

  try {
    const existingItem = await Stock.findOne({
      user: req.user,
      itemName: itemName.trim().toLowerCase(),
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json({ message: "Stock updated", stock: existingItem });
    }

    const newItem = await Stock.create({
      user: req.user,
      itemName: itemName.trim().toLowerCase(),
      quantity,
      price,
    });

    res.status(201).json({ message: "New stock added", stock: newItem });
  } catch (error) {
    console.error("Error adding stock:", error.message);
    res.status(500).json({ message: "Error adding stock", error });
  }
});

router.get("/check-stock", authenticateToken, async (req, res) => {
  try {
    const stocks = await Stock.find({ user: req.user });
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock", error });
  }
});

router.post("/update-sales", authenticateToken, async (req, res) => {
  const { itemName, quantity } = req.body;

  try {
    const item = await Stock.findOne({
      user: req.user,
      itemName: itemName.trim().toLowerCase(),
    });
    if (!item) {
      return res.status(400).json({ message: "Item not present in Stock" });
    }
    if (item.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity in stock" });
    }
    item.quantity -= quantity;
    await item.save();
    res.status(201).json({ message: "Sales Updated", item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update/:id", authenticateToken, async (req, res) => {
  const { quantity, price } = req.body;

  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { $set: { quantity, price } },
      { new: true }
    );

    if (!updatedStock)
      return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Stock updated", stock: updatedStock });
  } catch (error) {
    res.status(500).json({ message: "Error updating stock", error });
  }
});

router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Stock.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });

    if (!deleted) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Stock item deleted", stock: deleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting stock", error });
  }
});

export default router;
