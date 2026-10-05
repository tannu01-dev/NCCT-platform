const QRCode = require("qrcode");

const Certificate =
  require("../models/Certificate");

const Enrollment =
  require("../models/Enrollment");

const Programme =
  require("../models/Programme");

const {
  checkProgrammeCompletion,
} = require("../services/completionService");

const createCertificateNumber = () => {
  const year =
    new Date().getFullYear();

  const random =
    Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

  return `SS-${year}-${random}`;
};

const getBaseUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  );
};

const generateCertificate =
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


      if (!completion.eligible) {
        return res.status(400).json({
          success: false,

          message:
            "Certificate requirements are not completed",

          completion,
        });
      }

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
        return res.status(404).json({
          success: false,

          message:
            "Enrollment not found",
        });
      }

      const programme =
        await Programme.findById(
          programmeId
        ).populate(
          "institute",
          "name"
        );


      if (!programme) {
        return res.status(404).json({
          success: false,

          message:
            "Programme not found",
        });
      }


      if (!programme.institute) {
        return res.status(400).json({
          success: false,

          message:
            "Programme institute is missing",
        });
      }

      let certificate =
        await Certificate.findOne({
          trainee: req.user._id,

          programme: programmeId,
        }).populate([
          {
            path: "trainee",

            select: "name email",
          },

          {
            path: "programme",

            select:
              "title code category duration",
          },

          {
            path: "institute",

            select: "name",
          },

          {
            path: "enrollment",

            select:
              "status enrolledAt",
          },
        ]);

      if (certificate) {
        if (
          enrollment.status !==
          "completed"
        ) {
          enrollment.status =
            "completed";

          await enrollment.save();
        }


        return res.json({
          success: true,

          message:
            "Certificate already generated",

          certificate,

          completion,

          alreadyGenerated: true,
        });
      }

      let certificateNumber =
        createCertificateNumber();


      // Small collision protection

      while (
        await Certificate.exists({
          certificateNumber,
        })
      ) {
        certificateNumber =
          createCertificateNumber();
      }

      const verificationUrl =
        `${getBaseUrl()}/verify-certificate/${certificateNumber}`;

      const qrCode =
        await QRCode.toDataURL(
          verificationUrl,
          {
            width: 300,

            margin: 2,
          }
        );

      certificate =
        await Certificate.create({
          trainee:
            req.user._id,

          programme:
            programmeId,

          institute:
            programme.institute._id,

          enrollment:
            enrollment._id,

          certificateNumber,

          issuedAt:
            new Date(),

          verificationUrl,

          qrCode,
        });

      enrollment.status =
        "completed";

      await enrollment.save();

      certificate =
        await Certificate.findById(
          certificate._id
        ).populate([
          {
            path: "trainee",

            select: "name email",
          },

          {
            path: "programme",

            select:
              "title code category duration",
          },

          {
            path: "institute",

            select: "name",
          },

          {
            path: "enrollment",

            select:
              "status enrolledAt",
          },
        ]);

      return res.status(201).json({
        success: true,

        message:
          "Certificate generated successfully",

        certificate,

        completion,
      });

    } catch (error) {
      console.error(
        "Generate certificate error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to generate certificate",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  };

const getMyCertificates =
  async (req, res) => {
    try {
      const certificates =
        await Certificate.find({
          trainee: req.user._id,
        })
          .populate(
            "programme",
            "title code category duration"
          )
          .populate(
            "institute",
            "name"
          )
          .populate(
            "enrollment",
            "status enrolledAt"
          )
          .sort({
            issuedAt: -1,
          });


      return res.json({
        success: true,

        count:
          certificates.length,

        certificates,
      });

    } catch (error) {
      console.error(
        "Get certificates error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to load certificates",
      });
    }
  };

const getCertificateStatus =
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


      const certificate =
        await Certificate.findOne({
          trainee: req.user._id,

          programme: programmeId,
        }).populate([
          {
            path: "programme",

            select:
              "title code category duration",
          },

          {
            path: "institute",

            select: "name",
          },

          {
            path: "enrollment",

            select:
              "status enrolledAt",
          },
        ]);


      return res.json({
        success: true,

        eligible:
          completion.eligible,

        completion,

        certificate,
      });

    } catch (error) {
      console.error(
        "Certificate status error:",
        error
      );


      return res.status(500).json({
        success: false,

        message:
          "Failed to check certificate status",
      });
    }
  };

const verifyCertificate =
  async (req, res) => {
    try {
      const {
        certificateNumber,
      } = req.params;

      if (!certificateNumber) {
        return res.status(400).json({
          success: false,

          verified: false,

          message:
            "Certificate number is required",
        });
      }

      const certificate =
        await Certificate.findOne({
          certificateNumber:
            certificateNumber.toUpperCase(),
        }).populate([
          {
            path: "trainee",

            select: "name",
          },

          {
            path: "programme",

            select:
              "title code category duration",
          },

          {
            path: "institute",

            select: "name",
          },

          {
            path: "enrollment",

            select:
              "status enrolledAt",
          },
        ]);

      if (!certificate) {
        return res.status(404).json({
          success: false,

          verified: false,

          message:
            "Certificate not found",
        });
      }

      return res.json({
        success: true,

        verified: true,

        certificate: {
          certificateNumber:
            certificate.certificateNumber,

          traineeName:
            certificate.trainee?.name,

          programme:
            certificate.programme,

          institute:
            certificate.institute,

          enrollment:
            certificate.enrollment,

          issuedAt:
            certificate.issuedAt,

          verificationUrl:
            certificate.verificationUrl,

          // IMPORTANT:
          // QR CODE IS ALSO RETURNED
          qrCode:
            certificate.qrCode,
        },
      });

    } catch (error) {
      console.error(
        "Verify certificate error:",
        error
      );


      return res.status(500).json({
        success: false,

        verified: false,

        message:
          "Certificate verification failed",
      });
    }
  };

module.exports = {
  generateCertificate,

  getMyCertificates,

  getCertificateStatus,

  verifyCertificate,
};
