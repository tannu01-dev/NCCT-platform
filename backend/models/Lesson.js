const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
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

    contentType: {
      type: String,
      enum: ["video", "pdf", "link", "text"],
      required: true,
    },

    contentUrl: {
      type: String,
      trim: true,
      default: "",
    },

    textContent: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
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

lessonSchema.index(
  { module: 1, order: 1 },
  { unique: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);