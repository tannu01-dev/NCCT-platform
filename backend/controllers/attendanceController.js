const Enrollment = require("../models/Enrollment");
const Programme = require("../models/Programme");
const Attendance = require("../models/Attendance");

const normalizeDate = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  value.setHours(0, 0, 0, 0);

  return value;
};

const getTrainerProgrammeTrainees =
  async (req, res) => {
    try {
      const { programmeId } = req.params;

      const programme =
        await Programme.findOne({
          _id: programmeId,
          trainer: req.user._id,
        });

      if (!programme) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the trainer of this programme",
        });
      }

      const enrollments =
        await Enrollment.find({
          programme: programmeId,
          status: {
            $in: ["active", "completed"],
          },
        }).populate(
          "trainee",
          "name email"
        );

      return res.json({
        success: true,
        trainees: enrollments.map(
          (enrollment) => ({
            enrollmentId:
              enrollment._id,
            trainee:
              enrollment.trainee,
          })
        ),
      });
    } catch (error) {
      console.error(
        "Get attendance trainees error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load trainees",
      });
    }
  };

const getProgrammeAttendance =
  async (req, res) => {
    try {
      const {
        programmeId,
        date,
      } = req.params;

      const programme =
        await Programme.findOne({
          _id: programmeId,
          trainer: req.user._id,
        });

      if (!programme) {
        return res.status(403).json({
          success: false,
          message:
            "You are not the trainer of this programme",
        });
      }

      const normalizedDate =
        normalizeDate(date);

      if (!normalizedDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      const nextDate =
        new Date(normalizedDate);

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      const attendance =
        await Attendance.find({
          programme: programmeId,
          date: {
            $gte: normalizedDate,
            $lt: nextDate,
          },
        }).populate(
          "trainee",
          "name email"
        );

      return res.json({
        success: true,
        attendance,
      });
    } catch (error) {
      console.error(
        "Get attendance error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load attendance",
      });
    }
  };

const markAttendance = async (
  req,
  res
) => {
  try {
    const {
      programmeId,
      date,
      attendance,
    } = req.body;

    if (
      !programmeId ||
      !date ||
      !Array.isArray(attendance)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "programmeId, date and attendance are required",
      });
    }

    const programme =
      await Programme.findOne({
        _id: programmeId,
        trainer: req.user._id,
      });

    if (!programme) {
      return res.status(403).json({
        success: false,
        message:
          "You are not the trainer of this programme",
      });
    }

    const normalizedDate =
      normalizeDate(date);

    if (!normalizedDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    const traineeIds =
      await Enrollment.find({
        programme: programmeId,
        status: {
          $in: ["active", "completed"],
        },
      }).distinct("trainee");

    const validTraineeIds =
      new Set(
        traineeIds.map((id) =>
          id.toString()
        )
      );

    for (const record of attendance) {
      if (
        !record.traineeId ||
        !validTraineeIds.has(
          record.traineeId.toString()
        )
      ) {
        continue;
      }

      const status =
        record.status === "present"
          ? "present"
          : "absent";

      await Attendance.findOneAndUpdate(
        {
          trainee:
            record.traineeId,
          programme: programmeId,
          date: normalizedDate,
        },
        {
          trainee:
            record.traineeId,
          programme: programmeId,
          date: normalizedDate,
          status,
          markedBy: req.user._id,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    return res.json({
      success: true,
      message:
        "Attendance saved successfully",
    });
  } catch (error) {
    console.error(
      "Mark attendance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save attendance",
    });
  }
};

const getTraineeAttendance =
  async (req, res) => {
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

      const records =
        await Attendance.find({
          trainee: req.user._id,
          programme: programmeId,
        }).sort({
          date: 1,
        });

      const total = records.length;

      const present =
        records.filter(
          (item) =>
            item.status === "present"
        ).length;

      const percentage =
        total === 0
          ? 0
          : Math.round(
              (present / total) * 100
            );

      return res.json({
        success: true,
        records,
        total,
        present,
        absent: total - present,
        percentage,
      });
    } catch (error) {
      console.error(
        "Trainee attendance error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load attendance",
      });
    }
  };

module.exports = {
  getTrainerProgrammeTrainees,
  getProgrammeAttendance,
  markAttendance,
  getTraineeAttendance,
};