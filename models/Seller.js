import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    siteAddress: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Seller", sellerSchema);
