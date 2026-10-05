
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Institute = require("../models/Institute");

const QUALIFICATIONS = [
  "1st_year",
  "2nd_year",
  "graduate",
  "postgraduate",
];

const EXPERIENCE_LEVELS = [
  "beginner",
  "fresher",
  "experienced",
];

const createStaffUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      institute,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !role ||
      !institute
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, role and institute are required",
      });
    }

    if (
      !["trainer", "institute_admin"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only trainer or institute_admin can be created",
      });
    }

    const instituteExists =
      await Institute.findOne({
        _id: institute,
        isActive: true,
      });

    if (!instituteExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive institute",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
      institute,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: `${
        role === "trainer"
          ? "Trainer"
          : "Institute Admin"
      } created successfully`,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        institute: user.institute,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Create staff error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("institute", "name code")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY PROFILE
|--------------------------------------------------------------------------
*/

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    )
      .select("-password")
      .populate("institute", "name code");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get my profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const {
      qualification,
      experienceLevel,
    } = req.body;

    if (
      qualification !== undefined &&
      qualification !== null &&
      !QUALIFICATIONS.includes(qualification)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid qualification",
      });
    }

    if (
      experienceLevel !== undefined &&
      experienceLevel !== null &&
      !EXPERIENCE_LEVELS.includes(
        experienceLevel
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid experience level",
      });
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (qualification !== undefined) {
      user.qualification =
        qualification || null;
    }

    if (experienceLevel !== undefined) {
      user.experienceLevel =
        experienceLevel || null;
    }

    await user.save();

    const updatedUser =
      await User.findById(user._id)
        .select("-password")
        .populate(
          "institute",
          "name code"
        );

    res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update my profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  createStaffUser,
  getAllUsers,
  getMyProfile,
  updateMyProfile,
};