const express = require("express");

const {
  createApplication,
  getMyApplications,
  getInstituteApplications,
  approveApplication,
  rejectApplication,
} = require("../controllers/ApplicationController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// TRAINEE APPLY
router.post(
  "/",
  protect,
  authorize("trainee"),
  createApplication
);

// TRAINEE APPLICATIONS
router.get(
  "/my",
  protect,
  authorize("trainee"),
  getMyApplications
);

// INSTITUTE ADMIN APPLICATIONS
router.get(
  "/institute",
  protect,
  authorize("institute_admin"),
  getInstituteApplications
);

// APPROVE
router.patch(
  "/:id/approve",
  protect,
  authorize("institute_admin"),
  approveApplication
);

// REJECT
router.patch(
  "/:id/reject",
  protect,
  authorize("institute_admin"),
  rejectApplication
);

module.exports = router;