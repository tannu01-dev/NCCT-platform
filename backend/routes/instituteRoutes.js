const express = require("express");

const {
  createInstitute,
  getAllInstitutes,
  getInstituteById,
  updateInstitute,
  toggleInstituteStatus,
} = require("../controllers/instituteController");

const {
  protect,
  authorize,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Create institute
router.post(
  "/",
  protect,
  authorize("super_admin"),
  createInstitute
);

// Get all institutes
router.get(
  "/",
  protect,
  authorize("super_admin"),
  getAllInstitutes
);

// Get single institute
router.get(
  "/:id",
  protect,
  authorize("super_admin"),
  getInstituteById
);

// Update institute
router.put(
  "/:id",
  protect,
  authorize("super_admin"),
  updateInstitute
);

// Activate / deactivate
router.patch(
  "/:id/status",
  protect,
  authorize("super_admin"),
  toggleInstituteStatus
);

module.exports = router;
