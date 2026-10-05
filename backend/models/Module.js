const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

moduleSchema.index(
  { programme: 1, order: 1 },
  { unique: true }
);

module.exports = mongoose.model("Module", moduleSchema);