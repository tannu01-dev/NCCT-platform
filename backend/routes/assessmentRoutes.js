const express = require("express");

const {
  createAssignment,
  getTrainerAssignments,
  toggleAssignmentPublish,
  getMyAssignments,
  submitAssignment,

  createQuiz,
  getTrainerQuizzes,
  addQuizQuestion,
  toggleQuizPublish,
  getMyQuizzes,
  submitQuiz,
} = require("../controllers/assessmentController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Trainer creates assignment
router.post(
  "/programmes/:programmeId/assignments",
  protect,
  authorize("trainer"),
  createAssignment
);

// Trainer gets programme assignments
router.get(
  "/programmes/:programmeId/assignments",
  protect,
  authorize("trainer"),
  getTrainerAssignments
);

// Trainer publish/unpublish assignment
router.patch(
  "/assignments/:assignmentId/publish",
  protect,
  authorize("trainer"),
  toggleAssignmentPublish
);

// Trainee gets published assignments
router.get(
  "/my/assignments",
  protect,
  authorize("trainee"),
  getMyAssignments
);

// Trainee submits assignment
router.post(
  "/assignments/:assignmentId/submit",
  protect,
  authorize("trainee"),
  submitAssignment
);

// Trainer creates empty quiz
router.post(
  "/programmes/:programmeId/quizzes",
  protect,
  authorize("trainer"),
  createQuiz
);

// Trainer gets quizzes of programme
router.get(
  "/programmes/:programmeId/quizzes",
  protect,
  authorize("trainer"),
  getTrainerQuizzes
);

// Trainer adds individual question
router.post(
  "/quizzes/:quizId/questions",
  protect,
  authorize("trainer"),
  addQuizQuestion
);

// Trainer publish/unpublish quiz
router.patch(
  "/quizzes/:quizId/publish",
  protect,
  authorize("trainer"),
  toggleQuizPublish
);

// Trainee gets published quizzes
router.get(
  "/my/quizzes",
  protect,
  authorize("trainee"),
  getMyQuizzes
);

// Trainee submits quiz
router.post(
  "/quizzes/:quizId/submit",
  protect,
  authorize("trainee"),
  submitQuiz
);

module.exports = router;