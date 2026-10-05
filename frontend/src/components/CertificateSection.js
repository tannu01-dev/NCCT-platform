import { useEffect, useState } from "react";
import api from "../services/api";

function CertificateSection() {
  const [certificates, setCertificates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const loadCertificates =
    async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/certificates/my"
          );

        setCertificates(
          response.data.certificates || []
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load certificates"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCertificates();
  }, []);

  const generateCertificate =
    async (programmeId) => {
      try {
        setError("");
        setMessage("");

        const response =
          await api.post(
            `/certificates/generate/${programmeId}`
          );

        setMessage(
          response.data.message
        );

        loadCertificates();
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Programme is not completed yet"
        );
      }
    };

  const printCertificate = (
    certificate
  ) => {
    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1000,height=700"
      );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${certificate.certificateId}</title>

        <style>
          body {
            margin: 0;
            padding: 40px;
            font-family: Georgia, serif;
            background: #f5f7fb;
          }

          .certificate {
            max-width: 900px;
            margin: auto;
            padding: 70px;
            background: white;
            border: 12px solid #1d4ed8;
            text-align: center;
          }

          h1 {
            font-size: 46px;
            margin-bottom: 10px;
            color: #172033;
          }

          h2 {
            font-size: 32px;
            color: #2457d6;
          }

          .name {
            font-size: 36px;
            font-weight: bold;
            margin: 30px 0;
          }

          .programme {
            font-size: 24px;
            margin: 25px 0;
          }

          .details {
            margin-top: 40px;
            font-size: 16px;
            color: #555;
          }

          .certificate-id {
            margin-top: 30px;
            font-weight: bold;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .certificate {
              max-width: none;
              min-height: 650px;
            }
          }
        </style>
      </head>

      <body>
        <div class="certificate">

          <h1>CERTIFICATE</h1>

          <h2>OF COMPLETION</h2>

          <p>This certificate is proudly presented to</p>

          <div class="name">
            ${certificate.traineeName}
          </div>

          <p>
            for successfully completing the training programme
          </p>

          <div class="programme">
            <strong>
              ${certificate.programmeTitle}
            </strong>
          </div>

          <p>
            Programme Code:
            ${certificate.programmeCode}
          </p>

          <p>
            Institute:
            ${certificate.institute?.name || ""}
          </p>

          <div class="details">
            Issued on:
            ${new Date(
              certificate.issuedAt
            ).toLocaleDateString()}
          </div>

          <div class="certificate-id">
            Certificate ID:
            ${certificate.certificateId}
          </div>

        </div>
      </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return (
      <section className="dashboard-section">
        Loading certificates...
      </section>
    );
  }

  return (
    <section className="dashboard-section">

      <div className="section-heading">
        <div>
          <h2>My Certificates</h2>

          <p>
            View and print your completed
            training certificates.
          </p>
        </div>
      </div>

      {message && (
        <div className="dashboard-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="dashboard-message error">
          {error}
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="empty-state">
          No certificates issued yet.
          Complete your programme requirements
          to generate your certificate.
        </div>
      ) : (
        <div className="programme-grid">

          {certificates.map(
            (certificate) => (
              <div
                className="programme-card"
                key={certificate._id}
              >
                <span className="programme-code">
                  {certificate.certificateId}
                </span>

                <h3>
                  {certificate.programmeTitle}
                </h3>

                <p>
                  Issued on{" "}
                  {new Date(
                    certificate.issuedAt
                  ).toLocaleDateString()}
                </p>

                <button
                  className="primary-button"
                  onClick={() =>
                    printCertificate(
                      certificate
                    )
                  }
                >
                  View / Print Certificate
                </button>
              </div>
            )
          )}

        </div>
      )}
    </section>
  );
}

export default CertificateSection;