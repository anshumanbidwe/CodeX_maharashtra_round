const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    isBot: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["pending", "human", "bot", "winner", "waitlisted"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);