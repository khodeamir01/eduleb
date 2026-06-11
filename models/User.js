const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    
    bio: {
      type: String,
      maxlength: 500,
    },

    avatar: {
      type: String,
    },

    roles: {
      type: [String],
      enum: ["ADMIN", "USER", "TEACHER", "AUTHOR"],
      default: ["USER"],
    },
  },
  { timestamps: true }
);

const model = mongoose.model("User", userSchema);

module.exports = model;
