const mongoose = require("mongoose");

const checkoutItemSchema = new mongoose.Schema({
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

const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [checkoutItemSchema],

    authority: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 60 * 60 * 1000,
    },
  },
  { timestamps: true }
);



checkoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const model = mongoose.model("Checkout", checkoutSchema);

module.exports = model;
