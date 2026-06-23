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

    authority: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);


const model = mongoose.model("Order", orderSchema);

module.exports = model;
