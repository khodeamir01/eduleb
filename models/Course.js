const mongoose = require("mongoose");

const schema =new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description : {
        type: String,
        required: true
    },
    cover: {
        type: String,
         required: true,
    },
    discount : {
        type: Number,
        required: true
    },
    href: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type : String ,
         required: true
    },
    categoryID : {
        type: mongoose.Types.ObjectId,
        ref: "Category"
    },
    creator : {
        type : mongoose.Types.ObjectId,
        ref: "User"
    },
    
    rating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5
    },
  },
  { timestamps: true }
);

schema.virtual("sessions",{
    ref:"Session",
    localField: "_id",
    foreignField: "course"
});
schema.virtual("comments",{
    ref:"Comment",
    localField: "_id",
    foreignField: "course"
});


const model = mongoose.model("Course", schema);
module.exports = model;
