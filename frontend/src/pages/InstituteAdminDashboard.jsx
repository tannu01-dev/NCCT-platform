import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function InstituteAdminDashboard() {
  const { user, logout } = useAuth();

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/applications/institute"
      );

      setApplications(
        response.data.applications || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (
    applicationId
  ) => {
    try {
      setMessage("");
      setError("");

      await api.patch(
        `/applications/${applicationId}/approve`
      );

      setMessage(
        "Application approved and trainee enrolled successfully."
      );

      fetchApplications();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to approve application"
      );
    }
  };

  const handleReject = async (
    applicationId
  ) => {
    try {
      setMessage("");
      setError("");

      await api.patch(
        `/applications/${applicationId}/reject`
      );

      setMessage(
        "Application rejected successfully."
      );

      fetchApplications();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to reject application"
      );
    }
  };

  const pendingCount =
    applications.filter(
      (item) => item.status === "pending"
    ).length;

  const approvedCount =
    applications.filter(
      (item) => item.status === "approved"
    ).length;

  const rejectedCount =
    applications.filter(
      (item) => item.status === "rejected"
    ).length;

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">
            INSTITUTE ADMIN
          </p>

          <h1>
            Institute Administration
          </h1>

          <p>
            Manage trainee applications and
            enrollment approvals.
          </p>
        </div>

        <div className="header-user">
          <div>
            <strong>{user?.name}</strong>
            <span>Institute Admin</span>
          </div>

          <button
            className="secondary-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span>Total Applications</span>
          <strong>
            {applications.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="stat-card">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
        </div>

        <div className="stat-card">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </div>
      </section>

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

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Training Applications</h2>
            <p>
              Review trainee applications for
              your institute.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchApplications}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            No applications received yet.
          </div>
        ) : (
          <div className="application-list">
            {applications.map(
              (application) => (
                <div
                  className="application-card"
                  key={application._id}
                >
                  <div className="application-main">
                    <div>
                      <span className="application-id">
                        {
                          application.applicationId
                        }
                      </span>

                      <h3>
                        {
                          application.trainee
                            ?.name
                        }
                      </h3>

                      <p>
                        {
                          application.trainee
                            ?.email
                        }
                      </p>

                      <p>
                        {
                          application.trainee
                            ?.phone
                        }
                      </p>
                    </div>

                    <div>
                      <h4>
                        {
                          application.programme
                            ?.title
                        }
                      </h4>

                      <p>
                        Code:{" "}
                        {
                          application.programme
                            ?.code
                        }
                      </p>

                      <p>
                        Applied:{" "}
                        {new Date(
                          application.appliedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="application-footer">
                    <span
                      className={`application-status-badge ${application.status}`}
                    >
                      {application.status}
                    </span>

                    {application.status ===
                      "pending" && (
                      <div className="application-actions">
                        <button
                          className="primary-button"
                          onClick={() =>
                            handleApprove(
                              application._id
                            )
                          }
                        >
                          Approve & Enroll
                        </button>

                        <button
                          className="danger-button"
                          onClick={() =>
                            handleReject(
                              application._id
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default InstituteAdminDashboard;