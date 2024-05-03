const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems: [
    { type: mongoose.Schema.Types.ObjectId, ref: "orderItems", required: true },
  ],
  shippingAddress1: { type: String, required: true },
  shippingAddress2: { type: String, default: "" },
  city: { type: String, default: "" },
  country: { type: String, default: "" },
  zip: { type: String, default: "" },
  phone: { type: String, required: true },
  status: { type: String, required: true, default: "Pending" },
  totalPrice: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  dateOrdered: { type: Date, default: Date.now() },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

exports.Order = mongoose.model("orders", orderSchema);
