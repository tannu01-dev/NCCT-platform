const mongoose = require("mongoose");

const certificateSchema =
  new mongoose.Schema(
    {
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

      enrollment: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Enrollment",

        required: true,
      },

      certificateNumber: {
        type: String,

        required: true,

        unique: true,

        index: true,

        uppercase: true,

        trim: true,
      },

      issuedAt: {
        type: Date,

        default: Date.now,
      },

      verificationUrl: {
        type: String,

        required: true,

        trim: true,
      },

      qrCode: {
        type: String,

        required: true,
      },
    },

    {
      timestamps: true,
    }
  );


// One certificate per trainee per programme

certificateSchema.index(
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
    "Certificate",
    certificateSchema
  );