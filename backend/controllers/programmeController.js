
const Programme = require("../models/Programme");
const Institute = require("../models/Institute");
const User = require("../models/User");

const QUALIFICATION_LEVELS = {
  "1st_year": 1,
  "2nd_year": 2,
  graduate: 3,
  postgraduate: 4,
};

const ALLOWED_QUALIFICATIONS = [
  "1st_year",
  "2nd_year",
  "graduate",
  "postgraduate",
];

const ALLOWED_EXPERIENCE_LEVELS = [
  "beginner",
  "fresher",
  "experienced",
];

const createProgramme = async (req, res) => {
  try {
    const {
      title,
      code,
      description,
      category,
      duration,
      startDate,
      endDate,
      seats,
      minimumQualification,
      eligibleExperienceLevels,
    } = req.body;

    if (
      !title ||
      !code ||
      !description ||
      !category ||
      !duration ||
      !startDate ||
      !endDate ||
      !seats ||
      !minimumQualification ||
      !eligibleExperienceLevels
    ) {
      return res.status(400).json({
        success: false,
        message: "All programme fields are required",
      });
    }

    if (
      !ALLOWED_QUALIFICATIONS.includes(
        minimumQualification
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid minimum qualification",
      });
    }

    if (
      !Array.isArray(eligibleExperienceLevels) ||
      eligibleExperienceLevels.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one experience level is required",
      });
    }

    const invalidExperience =
      eligibleExperienceLevels.some(
        (level) =>
          !ALLOWED_EXPERIENCE_LEVELS.includes(level)
      );

    if (invalidExperience) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience level",
      });
    }

    const uniqueExperienceLevels = [
      ...new Set(eligibleExperienceLevels),
    ];

    const institute = await Institute.findById(
      req.user.institute
    );

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    if (!institute.isActive) {
      return res.status(400).json({
        success: false,
        message: "Institute is not active",
      });
    }

    const existingProgramme =
      await Programme.findOne({
        code: code.toUpperCase(),
      });

    if (existingProgramme) {
      return res.status(409).json({
        success: false,
        message: "Programme code already exists",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message:
          "End date must be after start date",
      });
    }

    const programme = await Programme.create({
      title,
      code: code.toUpperCase(),
      description,
      category,
      institute: req.user.institute,
      trainer: req.user._id,
      duration,
      startDate: start,
      endDate: end,
      seats,
      minimumQualification,
      eligibleExperienceLevels:
        uniqueExperienceLevels,
      status: "draft",
      registrationOpen: false,
      mode: "online",
    });

    const populatedProgramme =
      await Programme.findById(programme._id)
        .populate("institute", "name code")
        .populate("trainer", "name");

    res.status(201).json({
      success: true,
      message: "Programme created successfully",
      programme: populatedProgramme,
    });
  } catch (error) {
    console.error(
      "Create programme error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create programme",
    });
  }
};

const getAllProgrammes = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "trainer") {
      query.trainer = req.user._id;
    }

    if (req.user.role === "institute_admin") {
      query.institute = req.user.institute;
    }

    const programmes =
      await Programme.find(query)
        .populate("institute", "name code")
        .populate("trainer", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      programmes,
    });
  } catch (error) {
    console.error(
      "Get all programmes error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch programmes",
    });
  }
};

const getPublishedProgrammes = async (
  req,
  res
) => {
  try {
    const programmes =
      await Programme.find({
        status: "published",
        registrationOpen: true,
      })
        .populate("institute", "name code")
        .populate("trainer", "name")
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      programmes,
    });
  } catch (error) {
    console.error(
      "Get published programmes error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch published programmes",
    });
  }
};

const getProgrammeById = async (req, res) => {
  try {
    const { id } = req.params;

    const programme =
      await Programme.findById(id)
        .populate("institute", "name code")
        .populate("trainer", "name");

    if (!programme) {
      return res.status(404).json({
        success: false,
        message: "Programme not found",
      });
    }

    res.status(200).json({
      success: true,
      programme,
    });
  } catch (error) {
    console.error(
      "Get programme by ID error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch programme",
    });
  }
};

const updateProgramme = async (req, res) => {
  try {
    const { id } = req.params;

    const programme =
      await Programme.findOne({
        _id: id,
        trainer: req.user._id,
      });

    if (!programme) {
      return res.status(404).json({
        success: false,
        message:
          "Programme not found or you are not the owner",
      });
    }

    const {
      title,
      code,
      description,
      category,
      duration,
      startDate,
      endDate,
      seats,
      minimumQualification,
      eligibleExperienceLevels,
    } = req.body;

    if (code) {
      const existingProgramme =
        await Programme.findOne({
          code: code.toUpperCase(),
          _id: { $ne: id },
        });

      if (existingProgramme) {
        return res.status(409).json({
          success: false,
          message:
            "Programme code already exists",
        });
      }

      programme.code = code.toUpperCase();
    }

    if (title !== undefined) {
      programme.title = title;
    }

    if (description !== undefined) {
      programme.description = description;
    }

    if (category !== undefined) {
      programme.category = category;
    }

    if (duration !== undefined) {
      programme.duration = duration;
    }

    if (seats !== undefined) {
      programme.seats = seats;
    }

    if (minimumQualification !== undefined) {
      if (
        !ALLOWED_QUALIFICATIONS.includes(
          minimumQualification
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid minimum qualification",
        });
      }

      programme.minimumQualification =
        minimumQualification;
    }

    if (
      eligibleExperienceLevels !== undefined
    ) {
      if (
        !Array.isArray(
          eligibleExperienceLevels
        ) ||
        eligibleExperienceLevels.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one experience level is required",
        });
      }

      const invalidExperience =
        eligibleExperienceLevels.some(
          (level) =>
            !ALLOWED_EXPERIENCE_LEVELS.includes(
              level
            )
        );

      if (invalidExperience) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid experience level",
        });
      }

      programme.eligibleExperienceLevels = [
        ...new Set(eligibleExperienceLevels),
      ];
    }

    if (
      startDate !== undefined ||
      endDate !== undefined
    ) {
      const newStartDate = startDate
        ? new Date(startDate)
        : programme.startDate;

      const newEndDate = endDate
        ? new Date(endDate)
        : programme.endDate;

      if (newEndDate <= newStartDate) {
        return res.status(400).json({
          success: false,
          message:
            "End date must be after start date",
        });
      }

      programme.startDate = newStartDate;
      programme.endDate = newEndDate;
    }

    await programme.save();

    const populatedProgramme =
      await Programme.findById(programme._id)
        .populate("institute", "name code")
        .populate("trainer", "name");

    res.status(200).json({
      success: true,
      message: "Programme updated successfully",
      programme: populatedProgramme,
    });
  } catch (error) {
    console.error(
      "Update programme error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update programme",
    });
  }
};

const toggleProgrammeStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const programme =
      await Programme.findOne({
        _id: id,
        trainer: req.user._id,
      });

    if (!programme) {
      return res.status(404).json({
        success: false,
        message:
          "Programme not found or you are not the owner",
      });
    }

    if (programme.status === "published") {
      programme.status = "draft";
      programme.registrationOpen = false;
    } else {
      programme.status = "published";
      programme.registrationOpen = true;
    }

    await programme.save();

    res.status(200).json({
      success: true,
      message:
        "Programme status updated successfully",
      programme,
    });
  } catch (error) {
    console.error(
      "Toggle programme status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update programme status",
    });
  }
};

const checkProgrammeEligibility = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const programme =
      await Programme.findOne({
        _id: id,
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
      return res.status(200).json({
        success: true,
        eligible: false,
        qualificationEligible: false,
        experienceEligible: false,
        message:
          "Please update your qualification before applying.",
      });
    }

    if (!trainee.experienceLevel) {
      return res.status(200).json({
        success: true,
        eligible: false,
        qualificationEligible: false,
        experienceEligible: false,
        message:
          "Please update your experience level before applying.",
      });
    }

    const traineeLevel =
      QUALIFICATION_LEVELS[
        trainee.qualification
      ];

    const requiredLevel =
      QUALIFICATION_LEVELS[
        programme.minimumQualification
      ];

    const qualificationEligible =
      traineeLevel >= requiredLevel;

    const experienceEligible =
      programme.eligibleExperienceLevels.includes(
        trainee.experienceLevel
      );

    const eligible =
      qualificationEligible &&
      experienceEligible;

    let message;

    if (eligible) {
      message =
        "You are eligible for this programme.";
    } else if (
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

    return res.status(200).json({
      success: true,
      eligible,
      qualificationEligible,
      experienceEligible,
      yourQualification:
        trainee.qualification,
      requiredQualification:
        programme.minimumQualification,
      yourExperienceLevel:
        trainee.experienceLevel,
      allowedExperienceLevels:
        programme.eligibleExperienceLevels,
      message,
    });
  } catch (error) {
    console.error(
      "Check programme eligibility error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to check programme eligibility",
    });
  }
};

module.exports = {
  createProgramme,
  getAllProgrammes,
  getPublishedProgrammes,
  getProgrammeById,
  updateProgramme,
  toggleProgrammeStatus,
  checkProgrammeEligibility,
};