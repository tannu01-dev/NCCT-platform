const mongoose = require("mongoose");

const applicationSchema =
  new mongoose.Schema(
    {
      applicationId: {
        type: String,
        required: true,
        unique: true,
      },

      trainee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      programme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Programme",
        required: true,
      },

      institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institute",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
      },

      appliedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

applicationSchema.index(
  {
    trainee: 1,
    programme: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.model(
    "Application",
    applicationSchema
  );