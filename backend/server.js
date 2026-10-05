const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const instituteRoutes = require("./routes/instituteRoutes");
const programmeRoutes = require("./routes/programmeRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");

const progressRoutes = require("./routes/progressRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const completionRoutes = require("./routes/completionRoutes");

dotenv.config();

const app = express();

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sahyog Setu API is running",
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/institutes",
  instituteRoutes
);

app.use(
  "/api/programmes",
  programmeRoutes
);

// Trainer routes
app.use(
  "/api/trainer",
  trainerRoutes
);

// Application routes
app.use(
  "/api/applications",
  applicationRoutes
);

// Enrollment routes
app.use(
  "/api/enrollments",
  enrollmentRoutes
);

// Assessment routes
app.use(
  "/api/assessments",
  assessmentRoutes
);

// Existing trainer assessment routes
app.use(
  "/api/trainer",
  assessmentRoutes
);

app.use(
  "/api/progress",
  progressRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/certificates",
  certificateRoutes
);
app.use(
  "/api/completion",
  completionRoutes
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(
  (err, req, res, next) => {
    console.error(
      "Server Error:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });
  }
);

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);