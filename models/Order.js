const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  quantity: {
    type: Number,
    min: 1,
    required: true,
  },

  priceAtTimeOfPurchase: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    status: {
      type: String,
      enum: ["PROCESSING", "SHIPPED", "DELIVERED"],
      default: "PROCESSING",
    },

    authority: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

orderSchema.virtual("totalprice").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.priceAtTime * item.quantity;
  }, 0);
});

const model = mongoose.model("Order", orderSchema);

module.exports = model;
