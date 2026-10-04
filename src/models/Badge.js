const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["MILESTONE", "RANK"],
      required: true,
    },

    condition: {
      metric: String,
      operator: {
        type: String,
        enum: [">=", ">", "="],
      },
      value: Number,
    },

    rank: Number,

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Badge", badgeSchema);
