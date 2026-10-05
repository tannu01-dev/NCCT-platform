import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function SuperAdminDashboard() {
  const { user, logout } = useAuth();

  const [institutes, setInstitutes] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "trainer",
    institute: "",
  });

  const [instituteForm, setInstituteForm] = useState({
    name: "",
    code: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const fetchData = async () => {
    try {
      const [institutesResponse, usersResponse] =
        await Promise.all([
          api.get("/institutes"),
          api.get("/users"),
        ]);

      setInstitutes(
        institutesResponse.data.institutes || []
      );

      setUsers(
        usersResponse.data.users || []
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStaffChange = (e) => {
    setStaffForm({
      ...staffForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/users/staff",
        staffForm
      );

      setMessage(response.data.message);

      setStaffForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "trainer",
        institute: "",
      });

      fetchData();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to create staff account"
      );
    }
  };

  const handleInstituteChange = (e) => {
    setInstituteForm({
      ...instituteForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateInstitute = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/institutes",
        instituteForm
      );

      setMessage(response.data.message);

      setInstituteForm({
        name: "",
        code: "",
        description: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
      });

      fetchData();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to create institute"
      );
    }
  };

  const handleToggleInstitute = async (
    instituteId
  ) => {
    try {
      const response = await api.patch(
        `/institutes/${instituteId}/status`
      );

      setMessage(response.data.message);

      fetchData();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to update institute"
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-section">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <span className="dashboard-label">
            SAHYOG SETU
          </span>

          <h1>
            Super Admin Dashboard
          </h1>

          <p>
            Welcome, {user?.name}
          </p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>

      </header>

      {/* MESSAGE */}

      {message && (
        <div className="dashboard-message">
          {message}
        </div>
      )}

      {/* STATS */}

      <section className="dashboard-stats">

        <div className="stat-card">
          <span>
            Total Institutes
          </span>

          <strong>
            {institutes.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Active Institutes
          </span>

          <strong>
            {
              institutes.filter(
                (item) => item.isActive
              ).length
            }
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Trainers
          </span>

          <strong>
            {
              users.filter(
                (item) =>
                  item.role === "trainer"
              ).length
            }
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Institute Admins
          </span>

          <strong>
            {
              users.filter(
                (item) =>
                  item.role ===
                  "institute_admin"
              ).length
            }
          </strong>
        </div>

      </section>

      {/* CREATE STAFF */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>
              Create Staff Account
            </h2>

            <p>
              Create Trainer or Institute
              Admin accounts and assign
              them to an institute.
            </p>
          </div>

        </div>

        <form
          className="staff-form"
          onSubmit={handleCreateStaff}
        >

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={staffForm.name}
            onChange={handleStaffChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={staffForm.email}
            onChange={handleStaffChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={staffForm.password}
            onChange={handleStaffChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={staffForm.phone}
            onChange={handleStaffChange}
          />

          <select
            name="role"
            value={staffForm.role}
            onChange={handleStaffChange}
            required
          >
            <option value="trainer">
              Trainer
            </option>

            <option value="institute_admin">
              Institute Admin
            </option>
          </select>

          <select
            name="institute"
            value={staffForm.institute}
            onChange={handleStaffChange}
            required
          >
            <option value="">
              Select Institute
            </option>

            {institutes
              .filter(
                (item) => item.isActive
              )
              .map((institute) => (
                <option
                  key={institute._id}
                  value={institute._id}
                >
                  {institute.name} (
                  {institute.code})
                </option>
              ))}
          </select>

          <button type="submit">
            Create Staff Account
          </button>

        </form>

      </section>

      {/* CREATE INSTITUTE */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>
              Create Institute
            </h2>

            <p>
              Add a new training institute
              to Sahyog Setu.
            </p>
          </div>

        </div>

        <form
          className="institute-form"
          onSubmit={handleCreateInstitute}
        >

          <input
            type="text"
            name="name"
            placeholder="Institute Name"
            value={instituteForm.name}
            onChange={handleInstituteChange}
            required
          />

          <input
            type="text"
            name="code"
            placeholder="Institute Code"
            value={instituteForm.code}
            onChange={handleInstituteChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Institute Email"
            value={instituteForm.email}
            onChange={handleInstituteChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={instituteForm.phone}
            onChange={handleInstituteChange}
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={instituteForm.city}
            onChange={handleInstituteChange}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={instituteForm.state}
            onChange={handleInstituteChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={instituteForm.address}
            onChange={handleInstituteChange}
          />

          <textarea
            name="description"
            placeholder="Institute Description"
            value={
              instituteForm.description
            }
            onChange={handleInstituteChange}
          />

          <button type="submit">
            Create Institute
          </button>

        </form>

      </section>

      {/* INSTITUTES */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>
              Institutes
            </h2>

            <p>
              Manage registered training
              institutes.
            </p>
          </div>

        </div>

        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>

              <tr>
                <th>
                  Institute
                </th>

                <th>
                  Code
                </th>

                <th>
                  Email
                </th>

                <th>
                  Location
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>
              </tr>

            </thead>

            <tbody>

              {institutes.map(
                (institute) => (
                  <tr
                    key={
                      institute._id
                    }
                  >

                    <td>
                      <strong>
                        {institute.name}
                      </strong>
                    </td>

                    <td>
                      {institute.code}
                    </td>

                    <td>
                      {institute.email}
                    </td>

                    <td>
                      {institute.city ||
                        "-"}
                      {institute.state
                        ? `, ${institute.state}`
                        : ""}
                    </td>

                    <td>

                      <span
                        className={
                          institute.isActive
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {institute.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          handleToggleInstitute(
                            institute._id
                          )
                        }
                      >
                        {institute.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* STAFF */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>
              Staff Accounts
            </h2>

            <p>
              Trainers and Institute
              Administrators.
            </p>
          </div>

        </div>

        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>

              <tr>
                <th>
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Role
                </th>

                <th>
                  Institute
                </th>

                <th>
                  Status
                </th>
              </tr>

            </thead>

            <tbody>

              {users
                .filter(
                  (item) =>
                    item.role ===
                      "trainer" ||
                    item.role ===
                      "institute_admin"
                )
                .map((staff) => (
                  <tr
                    key={staff._id}
                  >

                    <td>
                      {staff.name}
                    </td>

                    <td>
                      {staff.email}
                    </td>

                    <td>
                      {staff.role ===
                      "trainer"
                        ? "Trainer"
                        : "Institute Admin"}
                    </td>

                    <td>
                      {staff.institute
                        ?.name || "-"}
                    </td>

                    <td>

                      <span
                        className={
                          staff.isActive
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {staff.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                  </tr>
                ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default SuperAdminDashboard;