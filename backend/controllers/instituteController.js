const Institute = require("../models/Institute");

// Create Institute
const createInstitute = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      email,
      phone,
      address,
      city,
      state,
    } = req.body;

    if (!name || !code || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, code and email are required",
      });
    }

    const existingInstitute = await Institute.findOne({
      $or: [
        { code: code.toUpperCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingInstitute) {
      return res.status(409).json({
        success: false,
        message: "Institute with this code or email already exists",
      });
    }

    const institute = await Institute.create({
      name,
      code: code.toUpperCase(),
      description,
      email: email.toLowerCase(),
      phone,
      address,
      city,
      state,
    });

    res.status(201).json({
      success: true,
      message: "Institute created successfully",
      institute,
    });
  } catch (error) {
    console.error("Create institute error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create institute",
    });
  }
};

// Get All Institutes
const getAllInstitutes = async (req, res) => {
  try {
    const institutes = await Institute.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: institutes.length,
      institutes,
    });
  } catch (error) {
    console.error("Get institutes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch institutes",
    });
  }
};

// Get Single Institute
const getInstituteById = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id);

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    res.status(200).json({
      success: true,
      institute,
    });
  } catch (error) {
    console.error("Get institute error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch institute",
    });
  }
};

// Update Institute
const updateInstitute = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id);

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    const {
      name,
      code,
      description,
      email,
      phone,
      address,
      city,
      state,
    } = req.body;

    if (code) {
      const existingCode = await Institute.findOne({
        code: code.toUpperCase(),
        _id: { $ne: req.params.id },
      });

      if (existingCode) {
        return res.status(409).json({
          success: false,
          message: "Institute code already exists",
        });
      }

      institute.code = code.toUpperCase();
    }

    if (name !== undefined) institute.name = name;
    if (description !== undefined) institute.description = description;
    if (email !== undefined) institute.email = email.toLowerCase();
    if (phone !== undefined) institute.phone = phone;
    if (address !== undefined) institute.address = address;
    if (city !== undefined) institute.city = city;
    if (state !== undefined) institute.state = state;

    await institute.save();

    res.status(200).json({
      success: true,
      message: "Institute updated successfully",
      institute,
    });
  } catch (error) {
    console.error("Update institute error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update institute",
    });
  }
};

// Activate / Deactivate Institute
const toggleInstituteStatus = async (req, res) => {
  try {
    const institute = await Institute.findById(req.params.id);

    if (!institute) {
      return res.status(404).json({
        success: false,
        message: "Institute not found",
      });
    }

    institute.isActive = !institute.isActive;

    await institute.save();

    res.status(200).json({
      success: true,
      message: `Institute ${
        institute.isActive ? "activated" : "deactivated"
      } successfully`,
      institute,
    });
  } catch (error) {
    console.error("Toggle institute error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update institute status",
    });
  }
};

module.exports = {
  createInstitute,
  getAllInstitutes,
  getInstituteById,
  updateInstitute,
  toggleInstituteStatus,
};