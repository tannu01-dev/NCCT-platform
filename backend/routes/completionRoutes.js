const express = require("express");

const {
  markLessonComplete,
  getCompletionStatus,
} = require("../controllers/completionController");

const {
  protect,
  authorize,
} = require("../middleware/authmiddleware");


const router = express.Router();

router.post(
  "/programmes/:programmeId/lessons/:lessonId/complete",

  protect,

  authorize("trainee"),

  markLessonComplete
);

router.get(
  "/programmes/:programmeId/status",

  protect,

  authorize("trainee"),

  getCompletionStatus
);


module.exports = router;
