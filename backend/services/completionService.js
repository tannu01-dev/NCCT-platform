const Programme = require("../models/Programme");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

const Enrollment = require("../models/Enrollment");

const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");

const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");

const LessonProgress = require("../models/LessonProgress");

const checkProgrammeCompletion = async (
  traineeId,
  programmeId
) => {
 
  const programme = await Programme.findById(
    programmeId
  );

  if (!programme) {
    return {
      eligible: false,
      message: "Programme not found",
      lessons: {
        total: 0,
        completed: 0,
        completedSuccessfully: false,
      },
      assignments: {
        total: 0,
        submitted: 0,
        completedSuccessfully: false,
      },
      quizzes: {
        total: 0,
        passed: 0,
        completedSuccessfully: false,
      },
    };
  }

  const enrollment =
    await Enrollment.findOne({
      trainee: traineeId,
      programme: programmeId,
      status: {
        $in: ["active", "completed"],
      },
    });

  if (!enrollment) {
    return {
      eligible: false,
      message:
        "You are not enrolled in this programme",

      lessons: {
        total: 0,
        completed: 0,
        completedSuccessfully: false,
      },

      assignments: {
        total: 0,
        submitted: 0,
        completedSuccessfully: false,
      },

      quizzes: {
        total: 0,
        passed: 0,
        completedSuccessfully: false,
      },
    };
  }

  const modules = await Module.find({
    programme: programmeId,
    isPublished: true,
  }).select("_id");


  const moduleIds = modules.map(
    (module) => module._id
  );

  const lessons = await Lesson.find({
    module: {
      $in: moduleIds,
    },
    isPublished: true,
  }).select("_id");


  const lessonIds = lessons.map(
    (lesson) => lesson._id
  );

  let completedLessons = [];

  if (lessonIds.length > 0) {
    completedLessons =
      await LessonProgress.find({
        trainee: traineeId,
        programme: programmeId,
        lesson: {
          $in: lessonIds,
        },
        completed: true,
      }).select("lesson");
  }


  const totalLessons = lessonIds.length;

  const completedLessonCount =
    completedLessons.length;


  const lessonsCompleted =
    completedLessonCount === totalLessons;

  const assignments =
    await Assignment.find({
      programme: programmeId,
      isPublished: true,
    }).select("_id");


  const assignmentIds =
    assignments.map(
      (assignment) => assignment._id
    );

  let submittedAssignments = [];


  if (assignmentIds.length > 0) {
    submittedAssignments =
      await AssignmentSubmission.find({
        trainee: traineeId,

        assignment: {
          $in: assignmentIds,
        },

        $or: [
          {
            status: "submitted",
          },

          {
            submittedAt: {
              $ne: null,
            },
          },

          {
            content: {
              $exists: true,
              $ne: "",
            },
          },

          {
            submissionText: {
              $exists: true,
              $ne: "",
            },
          },
        ],
      }).select("assignment");
  }


  // Remove duplicate assignment IDs
  const submittedAssignmentIds =
    new Set(
      submittedAssignments.map(
        (submission) =>
          submission.assignment.toString()
      )
    );


  const totalAssignments =
    assignmentIds.length;


  const submittedAssignmentCount =
    submittedAssignmentIds.size;


  const assignmentsCompleted =
    submittedAssignmentCount ===
    totalAssignments;

  const quizzes =
    await Quiz.find({
      programme: programmeId,
      isPublished: true,
    }).select("_id");


  const quizIds =
    quizzes.map(
      (quiz) => quiz._id
    );

  let passedQuizCount = 0;


  for (const quizId of quizIds) {
    const attempts =
      await QuizAttempt.find({
        trainee: traineeId,
        quiz: quizId,
      }).sort({
        createdAt: -1,
      });


    let quizPassed = false;


    for (const attempt of attempts) {
      const score =
        Number(attempt.score) || 0;

      const totalMarks =
        Number(attempt.totalMarks) || 0;


      if (totalMarks <= 0) {
        continue;
      }


      const percentage =
        (score / totalMarks) * 100;


      if (percentage >= 50) {
        quizPassed = true;
        break;
      }
    }


    if (quizPassed) {
      passedQuizCount++;
    }
  }


  const totalQuizzes =
    quizIds.length;


  const quizzesCompleted =
    passedQuizCount === totalQuizzes;

  const eligible =
    lessonsCompleted &&
    assignmentsCompleted &&
    quizzesCompleted;

  return {
    eligible,

    message: eligible
      ? "All programme completion requirements are completed"
      : "Programme completion requirements are not yet completed",

    programme: {
      id: programme._id,
      title: programme.title,
      code: programme.code,
    },

    enrollment: {
      id: enrollment._id,
      status: enrollment.status,
    },

    lessons: {
      total: totalLessons,
      completed: completedLessonCount,
      completedSuccessfully: lessonsCompleted,
    },

    assignments: {
      total: totalAssignments,
      submitted: submittedAssignmentCount,
      completedSuccessfully: assignmentsCompleted,
    },

    quizzes: {
      total: totalQuizzes,
      passed: passedQuizCount,
      completedSuccessfully: quizzesCompleted,
      passingPercentage: 50,
    },
  };
};


module.exports = {
  checkProgrammeCompletion,
};