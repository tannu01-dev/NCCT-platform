import { useEffect, useState } from "react";
import api from "../services/api";

function TrainerAttendance() {
  const [programmes, setProgrammes] =
    useState([]);

  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [trainees, setTrainees] =
    useState([]);

  const [attendance, setAttendance] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const loadProgrammes = async () => {
    try {
      const response =
        await api.get(
          "/trainer/programmes"
        );

      setProgrammes(
        response.data.programmes || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load programmes"
      );
    }
  };

  const loadTrainees = async () => {
    if (!selectedProgramme) {
      setTrainees([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [
        traineesResponse,
        attendanceResponse,
      ] = await Promise.all([
        api.get(
          `/attendance/trainer/programmes/${selectedProgramme}/trainees`
        ),
        api.get(
          `/attendance/trainer/programmes/${selectedProgramme}/date/${date}`
        ),
      ]);

      const list =
        traineesResponse.data.trainees ||
        [];

      const existing =
        attendanceResponse.data.attendance ||
        [];

      const attendanceMap = {};

      list.forEach((item) => {
        attendanceMap[
          item.trainee._id
        ] = "absent";
      });

      existing.forEach((item) => {
        const traineeId =
          item.trainee?._id ||
          item.trainee;

        if (traineeId) {
          attendanceMap[
            traineeId
          ] = item.status;
        }
      });

      setTrainees(list);
      setAttendance(
        attendanceMap
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgrammes();
  }, []);

  useEffect(() => {
    loadTrainees();
  }, [
    selectedProgramme,
    date,
  ]);

  const changeAttendance = (
    traineeId,
    status
  ) => {
    setAttendance((previous) => ({
      ...previous,
      [traineeId]: status,
    }));
  };

  const saveAttendance = async () => {
    try {
      if (!selectedProgramme) {
        setError(
          "Please select a programme."
        );
        return;
      }

      setLoading(true);
      setError("");
      setMessage("");

      const records =
        trainees.map((item) => ({
          traineeId:
            item.trainee._id,
          status:
            attendance[
              item.trainee._id
            ] || "absent",
        }));

      await api.post(
        "/attendance/trainer/mark",
        {
          programmeId:
            selectedProgramme,
          date,
          attendance: records,
        }
      );

      setMessage(
        "Attendance saved successfully."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">
            TRAINER ATTENDANCE
          </p>

          <h1>
            Attendance Management
          </h1>

          <p>
            Mark attendance for your
            enrolled trainees.
          </p>
        </div>
      </header>

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
            <h2>
              Select Training
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <select
            value={selectedProgramme}
            onChange={(event) =>
              setSelectedProgramme(
                event.target.value
              )
            }
          >
            <option value="">
              Select Programme
            </option>

            {programmes.map(
              (programme) => (
                <option
                  key={programme._id}
                  value={programme._id}
                >
                  {programme.title}
                </option>
              )
            )}
          </select>

          <input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value
              )
            }
          />
        </div>

        {loading ? (
          <div className="empty-state">
            Loading...
          </div>
        ) : trainees.length === 0 ? (
          <div className="empty-state">
            No enrolled trainees found.
          </div>
        ) : (
          <>
            <div className="assignment-list">
              {trainees.map((item) => {
                const trainee =
                  item.trainee;

                return (
                  <div
                    className="assignment-card"
                    key={trainee._id}
                  >
                    <div>
                      <h3>
                        {trainee.name}
                      </h3>

                      <p>
                        {trainee.email}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                      }}
                    >
                      <button
                        className={
                          attendance[
                            trainee._id
                          ] ===
                          "present"
                            ? "primary-button"
                            : "secondary-button"
                        }
                        onClick={() =>
                          changeAttendance(
                            trainee._id,
                            "present"
                          )
                        }
                      >
                        Present
                      </button>

                      <button
                        className={
                          attendance[
                            trainee._id
                          ] ===
                          "absent"
                            ? "primary-button"
                            : "secondary-button"
                        }
                        onClick={() =>
                          changeAttendance(
                            trainee._id,
                            "absent"
                          )
                        }
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="primary-button"
              onClick={
                saveAttendance
              }
              disabled={loading}
            >
              Save Attendance
            </button>
          </>
        )}
      </section>
    </div>
  );
}

export default TrainerAttendance;