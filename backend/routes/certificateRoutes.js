const express = require("express");

const {
  generateCertificate,
  getMyCertificates,
  getCertificateStatus,
  verifyCertificate,
} = require("../controllers/certificateController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");


const router = express.Router();

router.get(
  "/verify/:certificateNumber",

  verifyCertificate
);

router.get(
  "/my",

  protect,

  authorize("trainee"),

  getMyCertificates
);

router.get(
  "/status/:programmeId",

  protect,

  authorize("trainee"),

  getCertificateStatus
);

router.post(
  "/generate/:programmeId",

  protect,

  authorize("trainee"),

  generateCertificate
);


module.exports = router;