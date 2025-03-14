const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(\+\d{1,3}[- ]?)?\d{10}$/, // Validates phone numbers with optional country code
        "Please enter a valid phone number",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
