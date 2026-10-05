const express = require("express");

const {
  getMyEnrollments,
  checkEnrollment,
} = require("../controllers/enrollmentController");

const {
  protect,
  authorize,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.get(
  "/my",
  protect,
  authorize("trainee"),
  getMyEnrollments
);

router.get(
  "/check/:programmeId",
  protect,
  authorize("trainee"),
  checkEnrollment
);

module.exports = router;
