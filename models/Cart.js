const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    quantity: {
        type: Number,
        min: 1,
        required: true
    },

    priceAtTime: {
        type: Number,
        required: true
    }
})

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [cartItemSchema]
}, {timestamps: true})

cartSchema.virtual("totalprice").get(function() {
    return this.items.reduce((total, item) => {
      return total + item.priceAtTime * item.quantity
    }, 0)
  })


const model = mongoose.model("Cart", cartSchema )

module.exports = model