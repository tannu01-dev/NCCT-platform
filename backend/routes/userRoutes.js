const express = require("express");

const {
  createStaffUser,
  getAllUsers,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authmiddleware");

const router = express.Router();

// Only Super Admin can create staff
router.post(
  "/staff",
  protect,
  authorize("super_admin"),
  createStaffUser
);

// Super Admin + Institute Admin can see all users
router.get(
  "/",
  protect,
  authorize(
    "super_admin",
    "institute_admin"
  ),
  getAllUsers
);

// Get logged-in user's profile
router.get(
  "/profile",
  protect,
  authorize(
    "super_admin",
    "institute_admin",
    "trainer",
    "trainee"
  ),
  getMyProfile
);

// Update logged-in user's profile
router.put(
  "/profile",
  protect,
  authorize(
    "super_admin",
    "institute_admin",
    "trainer",
    "trainee"
  ),
  updateMyProfile
);

module.exports = router;
