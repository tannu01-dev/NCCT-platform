import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Certificate.css";

function Certificate() {
  const location = useLocation();
  const navigate = useNavigate();

  const certificate = location.state?.certificate;

  if (!certificate) {
    return (
      <div className="certificate-error-page">
        <div className="certificate-error-card">
          <h2>Certificate not found</h2>

          <p>
            Certificate information is not available.
            Please open the certificate again from
            My Certificates.
          </p>

          <button
            className="certificate-back-btn"
            onClick={() => navigate("/trainee")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const traineeName =
    certificate.trainee?.name ||
    certificate.traineeName ||
    "Trainee";

  const programmeTitle =
    certificate.programme?.title ||
    certificate.programmeTitle ||
    "Training Programme";

  const instituteName =
    certificate.institute?.name ||
    certificate.instituteName ||
    "Sahyog Setu Institute";

  const certificateNumber =
    certificate.certificateNumber ||
    "N/A";

  const issuedDate = certificate.issuedAt
    ? new Date(
        certificate.issuedAt
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const verificationUrl =
    certificate.verificationUrl || "";

  const qrCode =
    certificate.qrCode || "";

  const handlePrint = () => {
    window.print();
  };

  const handleVerify = () => {
    if (!verificationUrl) {
      return;
    }

    window.open(
      verificationUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="certificate-page">

      <div className="certificate-actions no-print">

        <button
          className="certificate-action secondary"
          onClick={() => navigate("/trainee")}
        >
          ← Back
        </button>

        <div className="certificate-action-right">

          <button
            className="certificate-action secondary"
            onClick={handleVerify}
            disabled={!verificationUrl}
          >
            ✓ Verify Certificate
          </button>

          <button
            className="certificate-action primary"
            onClick={handlePrint}
          >
            🖨 Print / Save as PDF
          </button>

        </div>

      </div>

      <div className="certificate-wrapper">

        <div className="certificate">

          {/* Decorative borders */}

          <div className="certificate-border-outer">
            <div className="certificate-border-inner">

              <div className="certificate-header">

                <div className="certificate-logo">
                  SS
                </div>

                <div>
                  <h1>
                    SAHYOG SETU
                  </h1>

                  <p>
                    INTEGRATED TRAINING &
                    SKILL MANAGEMENT PLATFORM
                  </p>
                </div>

              </div>

              <div className="certificate-line" />

              <div className="certificate-title-section">

                <p className="certificate-small-title">
                  CERTIFICATE
                </p>

                <h2>
                  OF COMPLETION
                </h2>

                <p className="certificate-subtitle">
                  This certificate is proudly
                  presented to
                </p>

              </div>

              <div className="certificate-recipient">

                <h3>
                  {traineeName}
                </h3>

                <div className="recipient-line" />

              </div>

              <div className="certificate-description">

                <p>
                  This is to certify that
                  <strong>
                    {" "}
                    {traineeName}
                  </strong>{" "}
                  has successfully completed
                  the training programme
                </p>

                <h4>
                  {programmeTitle}
                </h4>

                <p>
                  conducted through
                  <strong>
                    {" "}
                    Sahyog Setu
                  </strong>
                  .
                </p>

              </div>

              <div className="certificate-details">

                <div className="certificate-detail">

                  <span>
                    Certificate Number
                  </span>

                  <strong>
                    {certificateNumber}
                  </strong>

                </div>

                <div className="certificate-detail">

                  <span>
                    Issuing Institute
                  </span>

                  <strong>
                    {instituteName}
                  </strong>

                </div>

                <div className="certificate-detail">

                  <span>
                    Date of Issue
                  </span>

                  <strong>
                    {issuedDate}
                  </strong>

                </div>

              </div>

              <div className="certificate-footer">

                <div className="certificate-signature">

                  <div className="signature-space" />

                  <div className="signature-line" />

                  <strong>
                    Authorized Authority
                  </strong>

                  <span>
                    Sahyog Setu
                  </span>

                </div>

                <div className="certificate-qr">

                  {qrCode ? (
                    <img
                      src={qrCode}
                      alt="Certificate QR Code"
                    />
                  ) : (
                    <div className="qr-placeholder">
                      QR
                    </div>
                  )}

                  <span>
                    Scan to Verify
                  </span>

                </div>

              </div>

              <div className="certificate-verification-text">

                <span>
                  This certificate can be
                  electronically verified using
                  the QR code above.
                </span>

              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Certificate;