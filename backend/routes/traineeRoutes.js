const express = require("express");

const {
  getTraineeLearning,
} = require("../controllers/trainerController");

const {
  protect,
  authorize,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.get(
  "/learning/:programmeId",
  protect,
  authorize("trainee"),
  getTraineeLearning
);

module.exports = router;
