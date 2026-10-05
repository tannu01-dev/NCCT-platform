const Enrollment = require("../models/Enrollment");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const LessonProgress = require("../models/LessonProgress");

const markLessonComplete = async (
  req,
  res
) => {
  try {
    const {
      lessonId,
      programmeId,
      moduleId,
    } = req.body;

    if (
      !lessonId ||
      !programmeId ||
      !moduleId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "lessonId, programmeId and moduleId are required",
      });
    }

    const enrollment =
      await Enrollment.findOne({
        trainee: req.user._id,
        programme: programmeId,
        status: {
          $in: ["active", "completed"],
        },
      });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this programme",
      });
    }

    const module =
      await Module.findOne({
        _id: moduleId,
        programme: programmeId,
        isPublished: true,
      });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const lesson =
      await Lesson.findOne({
        _id: lessonId,
        module: moduleId,
        isPublished: true,
      });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const progress =
      await LessonProgress.findOneAndUpdate(
        {
          trainee: req.user._id,
          lesson: lessonId,
        },
        {
          trainee: req.user._id,
          programme: programmeId,
          module: moduleId,
          lesson: lessonId,
          completed: true,
          completedAt: new Date(),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    return res.json({
      success: true,
      message: "Lesson marked as complete",
      progress,
    });
  } catch (error) {
    console.error(
      "Mark lesson complete error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update lesson progress",
    });
  }
};

const getProgrammeProgress = async (
  req,
  res
) => {
  try {
    const { programmeId } = req.params;

    const enrollment =
      await Enrollment.findOne({
        trainee: req.user._id,
        programme: programmeId,
        status: {
          $in: ["active", "completed"],
        },
      });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this programme",
      });
    }

    const modules =
      await Module.find({
        programme: programmeId,
        isPublished: true,
      }).select("_id");

    const moduleIds = modules.map(
      (module) => module._id
    );

    const lessons =
      await Lesson.find({
        module: {
          $in: moduleIds,
        },
        isPublished: true,
      }).select("_id module");

    const completed =
      await LessonProgress.find({
        trainee: req.user._id,
        programme: programmeId,
        completed: true,
      }).select("lesson");

    const completedLessonIds =
      new Set(
        completed.map((item) =>
          item.lesson.toString()
        )
      );

    const totalLessons = lessons.length;

    const completedLessons =
      lessons.filter((lesson) =>
        completedLessonIds.has(
          lesson._id.toString()
        )
      ).length;

    const percentage =
      totalLessons === 0
        ? 100
        : Math.round(
            (completedLessons /
              totalLessons) *
              100
          );

    return res.json({
      success: true,
      totalLessons,
      completedLessons,
      percentage,
      completedLessonIds: Array.from(
        completedLessonIds
      ),
    });
  } catch (error) {
    console.error(
      "Get progress error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load progress",
    });
  }
};

module.exports = {
  markLessonComplete,
  getProgrammeProgress,
};