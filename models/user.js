const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  street: { type: String },
  apartment: { type: String },
  city: { type: String },
  country: { type: String },
  zip: { type: String },
  isAdmin: { type: Boolean, default: false },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

exports.User = mongoose.model("users", userSchema);
