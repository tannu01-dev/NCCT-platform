const express = require("express");

const {
  getMyProgrammes,
  getProgrammeModules,

  createModule,
  deleteModule,
  toggleModulePublish,

  createLesson,
  getModuleLessons,
  toggleLessonPublish,

  getTraineeLearning,
} = require("../controllers/trainerController");

const {
  protect,
  authorize,
} = require("../middleware/authmiddleware");

const router = express.Router();

router.get(
  "/programmes",
  protect,
  authorize("trainer"),
  getMyProgrammes
);

router.get(
  "/programmes/:programmeId/modules",
  protect,
  authorize("trainer"),
  getProgrammeModules
);

router.post(
  "/programmes/:programmeId/modules",
  protect,
  authorize("trainer"),
  createModule
);

router.delete(
  "/modules/:moduleId",
  protect,
  authorize("trainer"),
  deleteModule
);

router.patch(
  "/modules/:moduleId/publish",
  protect,
  authorize("trainer"),
  toggleModulePublish
);

router.post(
  "/modules/:moduleId/lessons",
  protect,
  authorize("trainer"),
  createLesson
);

router.get(
  "/modules/:moduleId/lessons",
  protect,
  authorize("trainer"),
  getModuleLessons
);

router.patch(
  "/lessons/:lessonId/publish",
  protect,
  authorize("trainer"),
  toggleLessonPublish
);

router.get(
  "/learning/:programmeId",
  protect,
  authorize("trainee"),
  getTraineeLearning
);

module.exports = router;
