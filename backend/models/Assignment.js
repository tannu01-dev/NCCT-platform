const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: {
      type: String,
      default: "",
      trim: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    maxMarks: {
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

module.exports = mongoose.model(
  "Assignment",
  assignmentSchema
);