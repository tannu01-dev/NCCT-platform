const express = require("express");

const {
  markLessonComplete,
  getProgrammeProgress,
} = require("../controllers/progressController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/lessons/complete",
  protect,
  authorize("trainee"),
  markLessonComplete
);

router.get(
  "/:programmeId",
  protect,
  authorize("trainee"),
  getProgrammeProgress
);

module.exports = router;