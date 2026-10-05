
const Application = require("../models/Application");
const Programme = require("../models/Programme");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

const QUALIFICATION_LEVELS = {
  "1st_year": 1,
  "2nd_year": 2,
  graduate: 3,
  postgraduate: 4,
};

const generateApplicationId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `APP-${year}-${random}`;
};

const createApplication = async (
  req,
  res
) => {
  try {
    const { programmeId } = req.body;

    if (!programmeId) {
      return res.status(400).json({
        success: false,
        message: "Programme is required",
      });
    }

    const programme =
      await Programme.findOne({
        _id: programmeId,
        status: "published",
        registrationOpen: true,
      });

    if (!programme) {
      return res.status(404).json({
        success: false,
        message:
          "Programme is not available for registration",
      });
    }

    const trainee =
      await User.findById(req.user._id).select(
        "qualification experienceLevel"
      );

    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: "Trainee not found",
      });
    }

    if (!trainee.qualification) {
      return res.status(400).json({
        success: false,
        eligible: false,
        message:
          "Please update your qualification before applying.",
      });
    }

    if (!trainee.experienceLevel) {
      return res.status(400).json({
        success: false,
        eligible: false,
        message:
          "Please update your experience level before applying.",
      });
    }

    const traineeQualificationLevel =
      QUALIFICATION_LEVELS[
        trainee.qualification
      ];

    const requiredQualificationLevel =
      QUALIFICATION_LEVELS[
        programme.minimumQualification
      ];

    const qualificationEligible =
      traineeQualificationLevel >=
      requiredQualificationLevel;

    const experienceEligible =
      programme.eligibleExperienceLevels.includes(
        trainee.experienceLevel
      );

    if (
      !qualificationEligible ||
      !experienceEligible
    ) {
      let message;

      if (
        !qualificationEligible &&
        !experienceEligible
      ) {
        message =
          "You do not meet the required qualification and experience criteria.";
      } else if (!qualificationEligible) {
        message =
          "Your qualification does not meet the minimum qualification required for this programme.";
      } else {
        message =
          "Your experience level is not eligible for this programme.";
      }

      return res.status(403).json({
        success: false,
        eligible: false,
        qualificationEligible,
        experienceEligible,
        message,
      });
    }

    const existingApplication =
      await Application.findOne({
        trainee: req.user._id,
        programme: programmeId,
      });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message:
          "You have already applied for this programme",
      });
    }

    const application =
      await Application.create({
        applicationId:
          generateApplicationId(),
        trainee: req.user._id,
        programme: programme._id,
        institute: programme.institute,
        status: "pending",
      });

    const populatedApplication =
      await Application.findById(
        application._id
      )
        .populate(
          "trainee",
          "name email phone qualification experienceLevel"
        )
        .populate(
          "programme",
          "title code"
        )
        .populate(
          "institute",
          "name code"
        );

    res.status(201).json({
      success: true,
      message:
        "Application submitted successfully",
      application: populatedApplication,
    });
  } catch (error) {
    console.error(
      "Create application error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to submit application",
    });
  }
};

const getMyApplications = async (
  req,
  res
) => {
  try {
    const applications =
      await Application.find({
        trainee: req.user._id,
      })
        .populate(
          "programme",
          "title code status startDate endDate"
        )
        .populate(
          "institute",
          "name code"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(
      "Get my applications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch applications",
    });
  }
};

const getInstituteApplications = async (
  req,
  res
) => {
  try {
    if (!req.user.institute) {
      return res.status(400).json({
        success: false,
        message:
          "Institute is not assigned to this admin",
      });
    }

    const applications =
      await Application.find({
        institute: req.user.institute,
      })
        .populate(
          "trainee",
          "name email phone"
        )
        .populate(
          "programme",
          "title code startDate endDate seats"
        )
        .populate(
          "institute",
          "name code"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(
      "Get institute applications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch institute applications",
    });
  }
};

const approveApplication = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const application =
      await Application.findOne({
        _id: id,
        institute: req.user.institute,
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending applications can be approved",
      });
    }

    const programme =
      await Programme.findById(
        application.programme
      );

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found",
      });
    }

    const existingEnrollment =
      await Enrollment.findOne({
        trainee: application.trainee,
        programme: application.programme,
      });

    if (existingEnrollment) {
      application.status = "approved";
      await application.save();

      const populatedEnrollment =
        await Enrollment.findById(
          existingEnrollment._id
        )
          .populate(
            "trainee",
            "name email"
          )
          .populate(
            "programme",
            "title code"
          )
          .populate(
            "institute",
            "name code"
          );

      return res.status(200).json({
        success: true,
        message:
          "Application approved successfully",
        enrollment:
          populatedEnrollment,
      });
    }

    const enrollment =
      await Enrollment.create({
        trainee: application.trainee,
        programme: application.programme,
        institute: application.institute,
        application: application._id,
        status: "active",
      });

    application.status = "approved";
    await application.save();

    const populatedEnrollment =
      await Enrollment.findById(
        enrollment._id
      )
        .populate(
          "trainee",
          "name email"
        )
        .populate(
          "programme",
          "title code"
        )
        .populate(
          "institute",
          "name code"
        );

    res.status(200).json({
      success: true,
      message:
        "Application approved and trainee enrolled successfully",
      enrollment:
        populatedEnrollment,
    });
  } catch (error) {
    console.error(
      "Approve application error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to approve application",
    });
  }
};

const rejectApplication = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const application =
      await Application.findOne({
        _id: id,
        institute: req.user.institute,
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending applications can be rejected",
      });
    }

    application.status = "rejected";

    await application.save();

    res.status(200).json({
      success: true,
      message:
        "Application rejected successfully",
      application,
    });
  } catch (error) {
    console.error(
      "Reject application error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to reject application",
    });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getInstituteApplications,
  approveApplication,
  rejectApplication,
};