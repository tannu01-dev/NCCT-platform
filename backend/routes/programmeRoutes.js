
const express = require("express");

const {
  createProgramme,
  getAllProgrammes,
  getPublishedProgrammes,
  getProgrammeById,
  updateProgramme,
  toggleProgrammeStatus,
  checkProgrammeEligibility,
} = require("../controllers/programmeController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("trainer"),
  createProgramme
);

router.get(
  "/published",
  protect,
  authorize("trainee"),
  getPublishedProgrammes
);

router.get(
  "/:id/eligibility",
  protect,
  authorize("trainee"),
  checkProgrammeEligibility
);

router.get(
  "/",
  protect,
  authorize(
    "super_admin",
    "institute_admin",
    "trainer"
  ),
  getAllProgrammes
);

router.get(
  "/:id",
  protect,
  authorize(
    "super_admin",
    "institute_admin",
    "trainer",
    "trainee"
  ),
  getProgrammeById
);

router.put(
  "/:id",
  protect,
  authorize("trainer"),
  updateProgramme
);

router.patch(
  "/:id/status",
  protect,
  authorize("trainer"),
  toggleProgrammeStatus
);

module.exports = router;