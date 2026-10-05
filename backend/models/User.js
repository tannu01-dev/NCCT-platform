
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: [
        "super_admin",
        "institute_admin",
        "trainer",
        "trainee",
      ],
      default: "trainee",
    },

    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      default: null,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Trainee's actual qualification
    qualification: {
      type: String,
      enum: [
        "1st_year",
        "2nd_year",
        "graduate",
        "postgraduate",
      ],
      default: null,
    },

    // Trainee's experience category
    experienceLevel: {
      type: String,
      enum: [
        "beginner",
        "fresher",
        "experienced",
      ],
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);