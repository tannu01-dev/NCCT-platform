const Programme = require("../models/Programme");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");

const getMyProgrammes = async (req, res) => {
  try {
    const programmes = await Programme.find({
      trainer: req.user._id,
    })
      .populate("institute", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: programmes.length,
      programmes,
    });
  } catch (error) {
    console.error("Get trainer programmes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned programmes",
    });
  }
};

const getProgrammeModules = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const programme = await Programme.findOne({
      _id: programmeId,
      trainer: req.user._id,
    });

    if (!programme) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this programme",
      });
    }

    const modules = await Module.find({
      programme: programmeId,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: modules.length,
      modules,
    });
  } catch (error) {
    console.error("Get modules error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch modules",
    });
  }
};

const createModule = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const {
      title,
      description,
      order,
    } = req.body;

    if (!title || !order) {
      return res.status(400).json({
        success: false,
        message: "Module title and order are required",
      });
    }

    const programme = await Programme.findOne({
      _id: programmeId,
      trainer: req.user._id,
    });

    if (!programme) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this programme",
      });
    }

    const existingModule = await Module.findOne({
      programme: programmeId,
      order,
    });

    if (existingModule) {
      return res.status(409).json({
        success: false,
        message: "A module with this order already exists",
      });
    }

    const module = await Module.create({
      programme: programmeId,
      title,
      description: description || "",
      order,
      isPublished: false,
    });

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      module,
    });
  } catch (error) {
    console.error("Create module error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create module",
    });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId)
      .populate("programme");

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    if (
      module.programme.trainer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this programme",
      });
    }

    await Lesson.deleteMany({
      module: moduleId,
    });

    await module.deleteOne();

    res.status(200).json({
      success: true,
      message: "Module and its lessons deleted successfully",
    });
  } catch (error) {
    console.error("Delete module error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete module",
    });
  }
};

const toggleModulePublish = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId)
      .populate("programme");

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    if (
      module.programme.trainer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    module.isPublished = !module.isPublished;

    await module.save();

    res.status(200).json({
      success: true,
      message: module.isPublished
        ? "Module published successfully"
        : "Module unpublished successfully",
      module,
    });
  } catch (error) {
    console.error("Toggle module publish error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update module status",
    });
  }
};

const createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const {
      title,
      description,
      contentType,
      contentUrl,
      textContent,
      duration,
      order,
    } = req.body;

    if (!title || !contentType || !order) {
      return res.status(400).json({
        success: false,
        message:
          "Title, content type and order are required",
      });
    }

    const module = await Module.findById(moduleId)
      .populate("programme");

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    if (
      module.programme.trainer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this programme",
      });
    }

    if (
      ["video", "pdf", "link"].includes(contentType) &&
      !contentUrl
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Content URL is required for this content type",
      });
    }

    if (
      contentType === "text" &&
      !textContent
    ) {
      return res.status(400).json({
        success: false,
        message: "Text content is required",
      });
    }

    const existingLesson = await Lesson.findOne({
      module: moduleId,
      order,
    });

    if (existingLesson) {
      return res.status(409).json({
        success: false,
        message:
          "A lesson with this order already exists",
      });
    }

    const lesson = await Lesson.create({
      module: moduleId,
      title,
      description: description || "",
      contentType,
      contentUrl: contentUrl || "",
      textContent: textContent || "",
      duration: duration || 0,
      order,
      isPublished: false,
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error("Create lesson error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create lesson",
    });
  }
};

const getModuleLessons = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId)
      .populate("programme");

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    if (
      module.programme.trainer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this programme",
      });
    }

    const lessons = await Lesson.find({
      module: moduleId,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    console.error("Get lessons error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
    });
  }
};

const toggleLessonPublish = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId)
      .populate({
        path: "module",
        populate: {
          path: "programme",
        },
      });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (
      lesson.module.programme.trainer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    lesson.isPublished = !lesson.isPublished;

    await lesson.save();

    res.status(200).json({
      success: true,
      message: lesson.isPublished
        ? "Lesson published successfully"
        : "Lesson unpublished successfully",
      lesson,
    });
  } catch (error) {
    console.error("Toggle lesson publish error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update lesson status",
    });
  }
};

const getTraineeLearning = async (req, res) => {
  try {
    const { programmeId } = req.params;

    // 1. Check active enrollment
    const enrollment = await Enrollment.findOne({
      trainee: req.user._id,
      programme: programmeId,
      status: "active",
    }).populate(
      "programme",
      "title code description"
    );

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not actively enrolled in this programme",
      });
    }

    // 2. Get published modules only
    const modules = await Module.find({
      programme: programmeId,
      isPublished: true,
    }).sort({ order: 1 });

    // 3. Get module IDs
    const moduleIds = modules.map(
      (module) => module._id
    );

    // 4. Get published lessons only
    const lessons = await Lesson.find({
      module: {
        $in: moduleIds,
      },
      isPublished: true,
    }).sort({ order: 1 });

    // 5. Attach lessons to modules
    const modulesWithLessons = modules.map(
      (module) => {
        const moduleLessons = lessons.filter(
          (lesson) =>
            lesson.module.toString() ===
            module._id.toString()
        );

        return {
          ...module.toObject(),
          lessons: moduleLessons,
        };
      }
    );

    res.status(200).json({
      success: true,
      programme: enrollment.programme,

      enrollment: {
        id: enrollment._id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      },

      modules: modulesWithLessons,
    });
  } catch (error) {
    console.error(
      "Get trainee learning error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch learning content",
    });
  }
};

module.exports = {
  getMyProgrammes,
  getProgrammeModules,

  createModule,
  deleteModule,
  toggleModulePublish,

  createLesson,
  getModuleLessons,
  toggleLessonPublish,

  getTraineeLearning,
};