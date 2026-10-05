const mongoose = require("mongoose");

const assignmentSubmissionSchema =
  new mongoose.Schema(
    {
      assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true,
      },

      trainee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      submissionText: {
        type: String,
        default: "",
        trim: true,
      },

      fileUrl: {
        type: String,
        default: "",
      },

      submittedAt: {
        type: Date,
        default: Date.now,
      },

      marks: {
        type: Number,
        default: null,
      },

      feedback: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "submitted",
          "graded",
        ],
        default: "submitted",
      },
    },
    {
      timestamps: true,
    }
  );

assignmentSubmissionSchema.index(
  {
    assignment: 1,
    trainee: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);