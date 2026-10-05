const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const Programme = require("../models/Programme");
const Module = require("../models/Module");
const Enrollment = require("../models/Enrollment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const QuizAttempt = require("../models/QuizAttempt");

const checkTrainerProgramme = async (programmeId, trainerId) => {
  if (!programmeId || !trainerId) {
    return null;
  }

  return await Programme.findOne({
    _id: programmeId,
    trainer: trainerId,
  });
};

// Create Assignment
const createAssignment = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const {
      module,
      title,
      description,
      instructions,
      dueDate,
      maxMarks,
    } = req.body;

    const programme = await checkTrainerProgramme(
      programmeId,
      req.user._id
    );

    if (!programme) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this programme",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Assignment title is required",
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: "Due date is required",
      });
    }

    const numericMaxMarks = Number(maxMarks);

    if (
      !Number.isFinite(numericMaxMarks) ||
      numericMaxMarks < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Max marks must be at least 1",
      });
    }

    if (module) {
      const moduleExists = await Module.findOne({
        _id: module,
        programme: programmeId,
      });

      if (!moduleExists) {
        return res.status(400).json({
          success: false,
          message: "Module does not belong to programme",
        });
      }
    }

    const assignment = await Assignment.create({
      programme: programmeId,
      module: module || null,
      title: title.trim(),
      description: description?.trim() || "",
      instructions: instructions?.trim() || "",
      dueDate,
      maxMarks: numericMaxMarks,
      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
    });
  }
};

// Get Trainer Assignments
const getTrainerAssignments = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const programme = await checkTrainerProgramme(
      programmeId,
      req.user._id
    );

    if (!programme) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this programme",
      });
    }

    const assignments = await Assignment.find({
      programme: programmeId,
    })
      .populate("module", "title order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get trainer assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
};

// Toggle Assignment Publish
const toggleAssignmentPublish = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(
      assignmentId
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const programme = await checkTrainerProgramme(
      assignment.programme,
      req.user._id
    );

    if (!programme) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this assignment",
      });
    }

    assignment.isPublished = !assignment.isPublished;

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: assignment.isPublished
        ? "Assignment published successfully"
        : "Assignment unpublished successfully",
      assignment,
    });
  } catch (error) {
    console.error(
      "Toggle assignment publish error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update assignment status",
    });
  }
};

// Get My Assignments - TRAINEE
const getMyAssignments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      trainee: req.user._id,
      status: "active",
    }).select("programme");

    const programmeIds = enrollments.map(
      (item) => item.programme
    );

    const assignments = await Assignment.find({
      programme: {
        $in: programmeIds,
      },
      isPublished: true,
    })
      .populate("programme", "title code")
      .populate("module", "title order")
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get my assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
};

// Submit Assignment
const submitAssignment = async (req, res) => {
  try {
    const { content, fileUrl } = req.body;

    const assignment = await Assignment.findById(
      req.params.assignmentId
    );

    if (!assignment || !assignment.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const enrollment = await Enrollment.findOne({
      trainee: req.user._id,
      programme: assignment.programme,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this programme",
      });
    }

    if (!content?.trim() && !fileUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Assignment content or file is required",
      });
    }

    const existingSubmission =
      await AssignmentSubmission.findOne({
        assignment: assignment._id,
        trainee: req.user._id,
      });

    if (existingSubmission) {
      existingSubmission.content = content?.trim() || "";
      existingSubmission.fileUrl = fileUrl?.trim() || "";
      existingSubmission.submittedAt = new Date();

      await existingSubmission.save();

      return res.status(200).json({
        success: true,
        message: "Assignment resubmitted successfully",
        submission: existingSubmission,
      });
    }

    const submission =
      await AssignmentSubmission.create({
        assignment: assignment._id,
        trainee: req.user._id,
        content: content?.trim() || "",
        fileUrl: fileUrl?.trim() || "",
        submittedAt: new Date(),
      });

    return res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      submission,
    });
  } catch (error) {
    console.error(
      "Submit assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit assignment",
    });
  }
};

/* =========================================================
   QUIZZES
========================================================= */

// Create Quiz
const createQuiz = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const {
      module,
      title,
      description,
    } = req.body;

    const programme = await checkTrainerProgramme(
      programmeId,
      req.user._id
    );

    if (!programme) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this programme",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    if (module) {
      const moduleExists = await Module.findOne({
        _id: module,
        programme: programmeId,
      });

      if (!moduleExists) {
        return res.status(400).json({
          success: false,
          message: "Module does not belong to programme",
        });
      }
    }

    const quiz = await Quiz.create({
      programme: programmeId,
      module: module || null,
      title: title.trim(),
      description: description?.trim() || "",
      questions: [],
      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create quiz",
    });
  }
};

// Get Trainer Quizzes
const getTrainerQuizzes = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const programme = await checkTrainerProgramme(
      programmeId,
      req.user._id
    );

    if (!programme) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this programme",
      });
    }

    const quizzes = await Quiz.find({
      programme: programmeId,
    })
      .populate("module", "title order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error(
      "Get trainer quizzes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
    });
  }
};

// Add Question to Quiz
const addQuizQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;

    const {
      question,
      options,
      correctAnswer,
      marks,
    } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question text is required",
      });
    }

    if (
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some(
        (option) =>
          typeof option !== "string" ||
          !option.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exactly 4 non-empty options are required",
      });
    }

    if (
      !["A", "B", "C", "D"].includes(
        correctAnswer
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Correct answer must be A, B, C or D",
      });
    }

    const questionMarks = Number(marks);

    if (
      !Number.isFinite(questionMarks) ||
      questionMarks < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question marks must be at least 1",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const programme = await checkTrainerProgramme(
      quiz.programme,
      req.user._id
    );

    if (!programme) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to modify this quiz",
      });
    }

    if (quiz.isPublished) {
      return res.status(400).json({
        success: false,
        message:
          "Published quiz cannot be modified",
      });
    }

    const correctAnswerIndex = [
      "A",
      "B",
      "C",
      "D",
    ].indexOf(correctAnswer);

    quiz.questions.push({
      question: question.trim(),
      options: options.map((option) =>
        option.trim()
      ),
      correctAnswer: correctAnswerIndex,
      marks: questionMarks,
    });

    await quiz.save();

    return res.status(201).json({
      success: true,
      message: "Question added successfully",
      quiz,
    });
  } catch (error) {
    console.error(
      "Add quiz question error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add question",
    });
  }
};

// Toggle Quiz Publish
const toggleQuizPublish = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const programme = await checkTrainerProgramme(
      quiz.programme,
      req.user._id
    );

    if (!programme) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this quiz",
      });
    }

    // Quiz cannot be published without questions.
    if (
      !quiz.isPublished &&
      (!quiz.questions ||
        quiz.questions.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least one question before publishing the quiz",
      });
    }

    quiz.isPublished = !quiz.isPublished;

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: quiz.isPublished
        ? "Quiz published successfully"
        : "Quiz unpublished successfully",
      quiz,
    });
  } catch (error) {
    console.error(
      "Toggle quiz publish error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update quiz status",
    });
  }
};

// Get My Quizzes - TRAINEE
const getMyQuizzes = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      trainee: req.user._id,
      status: "active",
    }).select("programme");

    const programmeIds = enrollments.map(
      (item) => item.programme
    );

    const quizzes = await Quiz.find({
      programme: {
        $in: programmeIds,
      },
      isPublished: true,
    })
      .populate("programme", "title code")
      .populate("module", "title order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error(
      "Get my quizzes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
    });
  }
};

// Submit Quiz
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findById(
      req.params.quizId
    );

    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const enrollment = await Enrollment.findOne({
      trainee: req.user._id,
      programme: quiz.programme,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this programme",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers are required",
      });
    }

    let score = 0;
    let totalMarks = 0;

    quiz.questions.forEach((question) => {
      totalMarks += question.marks;

      const answer = answers.find(
        (item) =>
          item.questionId ===
          question._id.toString()
      );

      if (
        answer &&
        Number(answer.selectedAnswer) ===
          question.correctAnswer
      ) {
        score += question.marks;
      }
    });

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      trainee: req.user._id,
      answers,
      score,
      totalMarks,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        score,
        totalMarks,
        percentage:
          totalMarks > 0
            ? Math.round(
                (score / totalMarks) * 100
              )
            : 0,
      },
      attempt,
    });
  } catch (error) {
    console.error(
      "Submit quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
    });
  }
};

module.exports = {
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
};