const Enrollment = require("../models/Enrollment");

// TRAINEE - MY ENROLLMENTS
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments =
      await Enrollment.find({
        trainee: req.user._id,
        status: "active",
      })
        .populate(
          "programme",
          "title code description category duration startDate endDate trainer"
        )
        .populate(
          "institute",
          "name code"
        )
        .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error(
      "Get my enrollments error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
    });
  }
};

// CHECK ENROLLMENT
const checkEnrollment = async (req, res) => {
  try {
    const enrollment =
      await Enrollment.findOne({
        trainee: req.user._id,
        programme: req.params.programmeId,
        status: "active",
      });

    res.status(200).json({
      success: true,
      enrolled: !!enrollment,
      enrollment: enrollment || null,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to check enrollment",
    });
  }
};

module.exports = {
  getMyEnrollments,
  checkEnrollment,
};