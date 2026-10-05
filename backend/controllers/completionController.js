const Enrollment =
  require("../models/Enrollment");

const Lesson =
  require("../models/Lesson");

const Module =
  require("../models/Module");

const LessonProgress =
  require("../models/LessonProgress");

const {
  checkProgrammeCompletion,
} = require("../services/completionService");

const markLessonComplete =
  async (req, res) => {
    try {
      const {
        programmeId,
        lessonId,
      } = req.params;

      const enrollment =
        await Enrollment.findOne({
          trainee: req.user._id,

          programme: programmeId,

          status: {
            $in: [
              "active",
              "completed",
            ],
          },
        });


      if (!enrollment) {
        return res.status(403).json({
          success: false,

          message:
            "You are not enrolled in this programme",
        });
      }

      const lesson =
        await Lesson.findById(
          lessonId
        );


      if (!lesson) {
        return res.status(404).json({
          success: false,

          message: "Lesson not found",
        });
      }

      const module =
        await Module.findById(
          lesson.module
        );


      if (!module) {
        return res.status(404).json({
          success: false,

          message:
            "Lesson module not found",
        });
      }

      if (
        module.programme.toString() !==
        programmeId.toString()
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Lesson does not belong to this programme",
        });
      }

      if (!lesson.isPublished) {
        return res.status(400).json({
          success: false,

          message:
            "This lesson is not published yet",
        });
      }

      if (!module.isPublished) {
        return res.status(400).json({
          success: false,

          message:
            "This lesson module is not published yet",
        });
      }

      const progress =
        await LessonProgress.findOneAndUpdate(
          {
            trainee: req.user._id,

            programme: programmeId,

            lesson: lessonId,
          },

          {
            $set: {
              completed: true,

              completedAt: new Date(),
            },
          },

          {
            new: true,

            upsert: true,

            setDefaultsOnInsert: true,
          }
        );

      const completion =
        await checkProgrammeCompletion(
          req.user._id,
          programmeId
        );


      return res.status(200).json({
        success: true,

        message:
          "Lesson marked as completed",

        progress,

        completion,
      });

    } catch (error) {
      console.error(
        "Mark lesson complete error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to mark lesson complete",
      });
    }
  };

const getCompletionStatus =
  async (req, res) => {
    try {
      const {
        programmeId,
      } = req.params;


      const completion =
        await checkProgrammeCompletion(
          req.user._id,
          programmeId
        );


      return res.status(200).json({
        success: true,

        completion,
      });

    } catch (error) {
      console.error(
        "Get completion status error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to get completion status",
      });
    }
  };


module.exports = {
  markLessonComplete,
  getCompletionStatus,
};