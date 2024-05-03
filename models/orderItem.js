const mongoose = require("mongoose");
const { Product } = require("./product");

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  qunatity: { type: Number, default: 0, required: true },
});

orderItemSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderItemSchema.set("toJSON", {
  virtuals: true,
});

exports.OrderItem = mongoose.model("orderItems", orderItemSchema);
