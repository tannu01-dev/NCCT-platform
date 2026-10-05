const express = require("express");

const {
  getTrainerProgrammeTrainees,
  getProgrammeAttendance,
  markAttendance,
  getTraineeAttendance,
} = require("../controllers/attendanceController");

const {
  protect,
  authorize,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.get(
  "/trainer/programmes/:programmeId/trainees",
  protect,
  authorize("trainer"),
  getTrainerProgrammeTrainees
);

router.get(
  "/trainer/programmes/:programmeId/date/:date",
  protect,
  authorize("trainer"),
  getProgrammeAttendance
);

router.post(
  "/trainer/mark",
  protect,
  authorize("trainer"),
  markAttendance
);

router.get(
  "/my/:programmeId",
  protect,
  authorize("trainee"),
  getTraineeAttendance
);

module.exports = router;
