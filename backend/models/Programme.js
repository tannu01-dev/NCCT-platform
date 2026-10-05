
const mongoose = require("mongoose");

const programmeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    // Minimum qualification required
    minimumQualification: {
      type: String,
      enum: [
        "1st_year",
        "2nd_year",
        "graduate",
        "postgraduate",
      ],
      required: true,
    },

    // Experience categories allowed for this programme
    eligibleExperienceLevels: {
      type: [
        {
          type: String,
          enum: [
            "beginner",
            "fresher",
            "experienced",
          ],
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message:
          "At least one experience level must be selected",
      },
    },

    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },

    registrationOpen: {
      type: Boolean,
      default: false,
    },

    mode: {
      type: String,
      default: "online",
      enum: ["online"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Programme", programmeSchema);