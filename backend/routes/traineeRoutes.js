const express = require("express");

const {
  getTraineeLearning,
} = require("../controllers/trainerController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/learning/:programmeId",
  protect,
  authorize("trainee"),
  getTraineeLearning
);

module.exports = router;