
import { useEffect, useState } from "react";
import api from "../services/api";

function TrainerDashboard() {
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgramme, setSelectedProgramme] = useState(null);

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [programmeForm, setProgrammeForm] = useState({
    title: "",
    code: "",
    description: "",
    category: "",
    duration: "",
    startDate: "",
    endDate: "",
    seats: "",
    minimumQualification: "",
    eligibleExperienceLevels: [],
  });

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    order: "",
  });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    contentType: "video",
    contentUrl: "",
    textContent: "",
    duration: "",
    order: "",
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    totalMarks: "",
  });
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    duration: "",
    passingMarks: "",
    totalMarks: "",
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    marks: 1,
  });
  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/trainer/programmes");

      setProgrammes(response.data.programmes || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load programmes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const handleProgrammeChange = (e) => {
    setProgrammeForm({
      ...programmeForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleExperienceChange = (e) => {
    const { value, checked } = e.target;

    setProgrammeForm((prev) => {
      const currentLevels =
        prev.eligibleExperienceLevels || [];

      if (checked) {
        return {
          ...prev,
          eligibleExperienceLevels: [
            ...currentLevels,
            value,
          ],
        };
      }

      return {
        ...prev,
        eligibleExperienceLevels:
          currentLevels.filter(
            (level) => level !== value
          ),
      };
    });
  };

  const handleCreateProgramme = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      if (!programmeForm.minimumQualification) {
        setError(
          "Please select minimum qualification."
        );
        return;
      }

      if (
        !programmeForm.eligibleExperienceLevels ||
        programmeForm.eligibleExperienceLevels.length === 0
      ) {
        setError(
          "Please select at least one eligible experience level."
        );
        return;
      }

      const response = await api.post(
        "/programmes",
        {
          title: programmeForm.title,
          code: programmeForm.code,
          description: programmeForm.description,
          category: programmeForm.category,
          duration: Number(programmeForm.duration),
          startDate: programmeForm.startDate,
          endDate: programmeForm.endDate,
          seats: Number(programmeForm.seats),

          minimumQualification:
            programmeForm.minimumQualification,

          eligibleExperienceLevels:
            programmeForm.eligibleExperienceLevels,
        }
      );

      setMessage(
        response.data.message ||
          "Programme created successfully"
      );

      setProgrammeForm({
        title: "",
        code: "",
        description: "",
        category: "",
        duration: "",
        startDate: "",
        endDate: "",
        seats: "",
        minimumQualification: "",
        eligibleExperienceLevels: [],
      });

      await fetchProgrammes();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create programme"
      );
    }
  };

  const handleSelectProgramme = async (programme) => {
    setSelectedProgramme(programme);
    setSelectedModule(null);
    setLessons([]);
    setMessage("");
    setError("");

    await fetchModules(programme._id);
    await fetchAssignments(programme._id);
    await fetchQuizzes(programme._id);
  };

  const handleToggleProgramme = async (programmeId) => {
    try {
      setMessage("");
      setError("");

      const response = await api.patch(
        `/programmes/${programmeId}/status`
      );

      setMessage(
        response.data.message ||
          "Programme status updated successfully"
      );

      await fetchProgrammes();

      if (
        selectedProgramme &&
        selectedProgramme._id === programmeId
      ) {
        setSelectedProgramme(
          response.data.programme
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update programme"
      );
    }
  };

  const fetchModules = async (programmeId) => {
    try {
      const response = await api.get(
        `/trainer/programmes/${programmeId}/modules`
      );

      setModules(response.data.modules || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load modules"
      );
    }
  };

  const handleModuleChange = (e) => {
    setModuleForm({
      ...moduleForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();

    if (!selectedProgramme) {
      setError("Please select a programme first");
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await api.post(
        `/trainer/programmes/${selectedProgramme._id}/modules`,
        {
          title: moduleForm.title,
          description: moduleForm.description,
          order: Number(moduleForm.order),
        }
      );

      setMessage(
        response.data.message ||
          "Module created successfully"
      );

      setModuleForm({
        title: "",
        description: "",
        order: "",
      });

      await fetchModules(selectedProgramme._id);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create module"
      );
    }
  };

  const handleToggleModulePublish = async (
    moduleId
  ) => {
    try {
      setMessage("");
      setError("");

      const response = await api.patch(
        `/trainer/modules/${moduleId}/publish`
      );

      setMessage(
        response.data.message ||
          "Module status updated successfully"
      );

      await fetchModules(selectedProgramme._id);

      const updatedModules = await api.get(
        `/trainer/programmes/${selectedProgramme._id}/modules`
      );

      const updatedModule =
        updatedModules.data.modules?.find(
          (module) => module._id === moduleId
        );

      if (updatedModule) {
        setSelectedModule(updatedModule);
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update module status"
      );
    }
  };
  const handleDeleteModule = async (moduleId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this module?"
    );

    if (!confirmDelete) return;

    try {
      setMessage("");
      setError("");

      const response = await api.delete(
        `/trainer/modules/${moduleId}`
      );

      setMessage(
        response.data.message ||
          "Module deleted successfully"
      );

      setSelectedModule(null);
      setLessons([]);

      await fetchModules(selectedProgramme._id);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to delete module"
      );
    }
  };
  const handleSelectModule = async (module) => {
    setSelectedModule(module);

    try {
      setError("");

      const response = await api.get(
        `/trainer/modules/${module._id}/lessons`
      );

      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load lessons"
      );
    }
  };

  const handleLessonChange = (e) => {
    setLessonForm({
      ...lessonForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();

    if (!selectedModule) {
      setError("Please select a module first");
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await api.post(
        `/trainer/modules/${selectedModule._id}/lessons`,
        {
          title: lessonForm.title,
          description: lessonForm.description,
          contentType: lessonForm.contentType,
          contentUrl: lessonForm.contentUrl,
          textContent: lessonForm.textContent,
          duration: Number(
            lessonForm.duration || 0
          ),
          order: Number(lessonForm.order),
        }
      );

      setMessage(
        response.data.message ||
          "Lesson created successfully"
      );

      setLessonForm({
        title: "",
        description: "",
        contentType: "video",
        contentUrl: "",
        textContent: "",
        duration: "",
        order: "",
      });

      const response2 = await api.get(
        `/trainer/modules/${selectedModule._id}/lessons`
      );

      setLessons(response2.data.lessons || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create lesson"
      );
    }
  };

  const handleToggleLessonPublish = async (
    lessonId
  ) => {
    try {
      setMessage("");
      setError("");

      const response = await api.patch(
        `/trainer/lessons/${lessonId}/publish`
      );

      setMessage(
        response.data.message ||
          "Lesson status updated successfully"
      );

      if (selectedModule) {
        const lessonsResponse = await api.get(
          `/trainer/modules/${selectedModule._id}/lessons`
        );

        setLessons(
          lessonsResponse.data.lessons || []
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update lesson status"
      );
    }
  };

  const fetchAssignments = async (programmeId) => {
    try {
      const response = await api.get(
        `/trainer/programmes/${programmeId}/assignments`
      );

      setAssignments(
        response.data.assignments || []
      );
    } catch (error) {
      console.error("Assignment API error:", error);

      setAssignments([]);

      setError(
        error.response?.data?.message ||
          "Failed to load assignments"
      );
    }
  };

  const handleAssignmentChange = (e) => {
    setAssignmentForm({
      ...assignmentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    if (!selectedProgramme) {
      setError("Please select a programme first");
      return;
    }

    if (!assignmentForm.dueDate) {
      setError("Please select an assignment due date");
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await api.post(
        `/trainer/programmes/${selectedProgramme._id}/assignments`,
        {
          title: assignmentForm.title,
          description: assignmentForm.description,
          dueDate: assignmentForm.dueDate,
          maxMarks: Number(
            assignmentForm.totalMarks
          ),
        }
      );

      setMessage(
        response.data.message ||
          "Assignment created successfully"
      );

      setAssignmentForm({
        title: "",
        description: "",
        dueDate: "",
        totalMarks: "",
      });

      await fetchAssignments(
        selectedProgramme._id
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create assignment"
      );
    }
  };
  const handleToggleAssignmentPublish = async (
    assignmentId
  ) => {
    try {
      setMessage("");
      setError("");

      const response = await api.patch(
        `/trainer/assignments/${assignmentId}/publish`
      );

      setMessage(
        response.data.message ||
          "Assignment status updated successfully"
      );

      await fetchAssignments(
        selectedProgramme._id
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update assignment status"
      );
    }
  };

  const fetchQuizzes = async (programmeId) => {
    try {
      const response = await api.get(
        `/trainer/programmes/${programmeId}/quizzes`
      );

      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error("Quiz API error:", error);

      setQuizzes([]);

      setError(
        error.response?.data?.message ||
          "Failed to load quizzes"
      );
    }
  };

  const handleQuizChange = (e) => {
    setQuizForm({
      ...quizForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    if (!selectedProgramme) {
      setError("Please select a programme first");
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await api.post(
        `/trainer/programmes/${selectedProgramme._id}/quizzes`,
        {
          title: quizForm.title,
          description: quizForm.description,
        }
      );

      setMessage(
        response.data.message ||
          "Quiz created successfully"
      );

      setQuizForm({
        title: "",
        description: "",
        duration: "",
        passingMarks: "",
        totalMarks: "",
      });

      await fetchQuizzes(
        selectedProgramme._id
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create quiz"
      );
    }
  };

  const handleToggleQuizPublish = async (
    quizId
  ) => {
    try {
      setMessage("");
      setError("");

      const response = await api.patch(
        `/trainer/quizzes/${quizId}/publish`
      );

      setMessage(
        response.data.message ||
          "Quiz status updated successfully"
      );

      await fetchQuizzes(
        selectedProgramme._id
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update quiz status"
      );
    }
  };

  const handleQuestionChange = (e) => {
    setQuestionForm({
      ...questionForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddQuestion = async (quizId) => {
    if (!questionForm.question.trim()) {
      setError("Please enter the question");
      return;
    }

    if (
      !questionForm.optionA.trim() ||
      !questionForm.optionB.trim() ||
      !questionForm.optionC.trim() ||
      !questionForm.optionD.trim()
    ) {
      setError("Please fill all four options");
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await api.post(
        `/trainer/quizzes/${quizId}/questions`,
        {
          question: questionForm.question,
          options: [
            questionForm.optionA,
            questionForm.optionB,
            questionForm.optionC,
            questionForm.optionD,
          ],
          correctAnswer:
            questionForm.correctAnswer,
          marks: Number(questionForm.marks),
        }
      );

      setMessage(
        response.data.message ||
          "Question added successfully"
      );

      setQuestionForm({
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        marks: 1,
      });

      if (selectedProgramme) {
        await fetchQuizzes(
          selectedProgramme._id
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to add question"
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        Loading Trainer Dashboard...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Trainer Dashboard</h1>

          <p>
            Create programmes and manage complete
            learning content.
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

      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Create New Programme</h2>

            <p>
              Create an online training programme
              for trainees.
            </p>
          </div>
        </div>

        <form
          className="programme-form"
          onSubmit={handleCreateProgramme}
        >

          <input
            type="text"
            name="title"
            placeholder="Programme Title"
            value={programmeForm.title}
            onChange={handleProgrammeChange}
            required
          />

          <input
            type="text"
            name="code"
            placeholder="Programme Code"
            value={programmeForm.code}
            onChange={handleProgrammeChange}
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={programmeForm.category}
            onChange={handleProgrammeChange}
            required
          />

          <input
            type="number"
            name="duration"
            placeholder="Duration in Days"
            value={programmeForm.duration}
            onChange={handleProgrammeChange}
            min="1"
            required
          />

          <input
            type="date"
            name="startDate"
            value={programmeForm.startDate}
            onChange={handleProgrammeChange}
            required
          />

          <input
            type="date"
            name="endDate"
            value={programmeForm.endDate}
            onChange={handleProgrammeChange}
            required
          />

          <input
            type="number"
            name="seats"
            placeholder="Number of Seats"
            value={programmeForm.seats}
            onChange={handleProgrammeChange}
            min="1"
            required
          />

          <select
            name="minimumQualification"
            value={
              programmeForm.minimumQualification
            }
            onChange={handleProgrammeChange}
            required
          >
            <option value="">
              Select Minimum Qualification
            </option>

            <option value="1st_year">
              1st Year
            </option>

            <option value="2nd_year">
              2nd Year
            </option>

            <option value="graduate">
              Graduate
            </option>

            <option value="postgraduate">
              Postgraduate
            </option>
          </select>
          <div className="eligibility-section">

            <label>
              <strong>
                Eligible Experience Levels
              </strong>
            </label>

            <div className="checkbox-group">

              <label>
                <input
                  type="checkbox"
                  value="beginner"
                  checked={programmeForm.eligibleExperienceLevels.includes(
                    "beginner"
                  )}
                  onChange={handleExperienceChange}
                />
                Beginner
              </label>

              <label>
                <input
                  type="checkbox"
                  value="fresher"
                  checked={programmeForm.eligibleExperienceLevels.includes(
                    "fresher"
                  )}
                  onChange={handleExperienceChange}
                />
                Fresher
              </label>

              <label>
                <input
                  type="checkbox"
                  value="experienced"
                  checked={programmeForm.eligibleExperienceLevels.includes(
                    "experienced"
                  )}
                  onChange={handleExperienceChange}
                />
                Experienced
              </label>

            </div>
          </div>

          <textarea
            name="description"
            placeholder="Programme Description"
            value={programmeForm.description}
            onChange={handleProgrammeChange}
            required
          />

          <button
            type="submit"
            className="primary-button"
          >
            Create Programme
          </button>

        </form>
      </section>

      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>My Programmes</h2>

            <p>
              Manage your programmes and learning
              content.
            </p>
          </div>
        </div>

        {programmes.length === 0 ? (
          <div className="empty-state">
            No programmes created yet.
          </div>
        ) : (
          <div className="programme-grid">

            {programmes.map((programme) => (

              <div
                key={programme._id}
                className={`programme-card ${
                  selectedProgramme?._id ===
                  programme._id
                    ? "selected-programme"
                    : ""
                }`}
              >

                <div className="programme-info">

                  <span className="programme-code">
                    {programme.code}
                  </span>

                  <h3>
                    {programme.title}
                  </h3>

                  <p>
                    {programme.description}
                  </p>

                  <div className="programme-meta">

                    <span>
                      Category:{" "}
                      {programme.category}
                    </span>

                    <span>
                      Seats: {programme.seats}
                    </span>

                    <span>
                      Duration:{" "}
                      {programme.duration} days
                    </span>

                  </div>

                  <div className="programme-meta">

                    <span>
                      Minimum Qualification:{" "}
                      {programme.minimumQualification
                        ? programme.minimumQualification
                            .replace("_", " ")
                            .replace(
                              /^./,
                              (char) =>
                                char.toUpperCase()
                            )
                        : "Not specified"}
                    </span>

                    <span>
                      Experience:{" "}
                      {programme.eligibleExperienceLevels?.length
                        ? programme.eligibleExperienceLevels
                            .map((level) =>
                              level
                                .replace(
                                  /^./,
                                  (char) =>
                                    char.toUpperCase()
                                )
                            )
                            .join(", ")
                        : "Not specified"}
                    </span>

                  </div>

                  <span
                    className={`programme-status ${
                      programme.status ===
                      "published"
                        ? "status-approved"
                        : "status-pending"
                    }`}
                  >
                    {programme.status}
                  </span>

                </div>

                <div className="programme-actions">

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleSelectProgramme(
                        programme
                      )
                    }
                  >
                    Manage Content
                  </button>

                  <button
                    type="button"
                    className={
                      programme.status ===
                      "published"
                        ? "danger-button"
                        : "primary-button"
                    }
                    onClick={() =>
                      handleToggleProgramme(
                        programme._id
                      )
                    }
                  >
                    {programme.status ===
                    "published"
                      ? "Unpublish"
                      : "Publish"}
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </section>

      {selectedProgramme && (
        <section className="dashboard-section">

          <div className="content-header">

            <div>
              <h2>
                {selectedProgramme.title}
              </h2>

              <p>
                Manage Modules, Lessons,
                Assignments and Quizzes.
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSelectedProgramme(null);
                setSelectedModule(null);
                setModules([]);
                setLessons([]);
                setAssignments([]);
                setQuizzes([]);
              }}
            >
              Close
            </button>

          </div>

          <div className="content-box">

            <h3>Modules</h3>

            <form
              className="content-form"
              onSubmit={handleCreateModule}
            >

              <input
                type="text"
                name="title"
                placeholder="Module Title"
                value={moduleForm.title}
                onChange={handleModuleChange}
                required
              />

              <input
                type="number"
                name="order"
                placeholder="Module Order"
                value={moduleForm.order}
                onChange={handleModuleChange}
                min="1"
                required
              />

              <textarea
                name="description"
                placeholder="Module Description"
                value={moduleForm.description}
                onChange={handleModuleChange}
              />

              <button
                type="submit"
                className="primary-button"
              >
                Add Module
              </button>

            </form>

            <div className="module-list">

              {modules.length === 0 ? (
                <p>
                  No modules created yet.
                </p>
              ) : (
                modules.map((module) => (

                  <div
                    key={module._id}
                    className={`module-item ${
                      selectedModule?._id ===
                      module._id
                        ? "selected-module"
                        : ""
                    }`}
                  >

                    <div
                      className="module-main"
                      onClick={() =>
                        handleSelectModule(module)
                      }
                    >

                      <div className="module-number">
                        {module.order}
                      </div>

                      <div>

                        <h4>
                          {module.title}
                        </h4>

                        <p>
                          {module.description ||
                            "No description"}
                        </p>

                      </div>

                    </div>

                    <div className="module-actions">

                      <span
                        className={`programme-status ${
                          module.isPublished
                            ? "status-approved"
                            : "status-pending"
                        }`}
                      >
                        {module.isPublished
                          ? "Published"
                          : "Draft"}
                      </span>

                      <button
                        type="button"
                        className={
                          module.isPublished
                            ? "danger-button"
                            : "primary-button"
                        }
                        onClick={() =>
                          handleToggleModulePublish(
                            module._id
                          )
                        }
                      >
                        {module.isPublished
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          handleDeleteModule(
                            module._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))
              )}

            </div>
          </div>

          {selectedModule && (
            <div className="content-box">

              <div className="content-header">

                <div>

                  <h3>
                    Lessons —{" "}
                    {selectedModule.title}
                  </h3>

                  <p>
                    Module status:{" "}
                    <strong>
                      {selectedModule.isPublished
                        ? "Published"
                        : "Draft"}
                    </strong>
                  </p>

                </div>

              </div>

              <form
                className="content-form"
                onSubmit={handleCreateLesson}
              >

                <input
                  type="text"
                  name="title"
                  placeholder="Lesson Title"
                  value={lessonForm.title}
                  onChange={handleLessonChange}
                  required
                />

                <input
                  type="number"
                  name="order"
                  placeholder="Lesson Order"
                  value={lessonForm.order}
                  onChange={handleLessonChange}
                  min="1"
                  required
                />

                <select
                  name="contentType"
                  value={lessonForm.contentType}
                  onChange={handleLessonChange}
                >

                  <option value="video">
                    Video
                  </option>

                  <option value="pdf">
                    PDF
                  </option>

                  <option value="link">
                    External Link
                  </option>

                  <option value="text">
                    Text / Notes
                  </option>

                </select>

                <input
                  type="number"
                  name="duration"
                  placeholder="Duration in minutes"
                  value={lessonForm.duration}
                  onChange={handleLessonChange}
                  min="0"
                />

                <input
                  type="text"
                  name="contentUrl"
                  placeholder="Content URL"
                  value={lessonForm.contentUrl}
                  onChange={handleLessonChange}
                />

                <textarea
                  name="description"
                  placeholder="Lesson Description"
                  value={lessonForm.description}
                  onChange={handleLessonChange}
                />

                <textarea
                  name="textContent"
                  placeholder="Text / Notes content"
                  value={lessonForm.textContent}
                  onChange={handleLessonChange}
                />

                <button
                  type="submit"
                  className="primary-button"
                >
                  Add Lesson
                </button>

              </form>

              <div className="lesson-list">

                {lessons.length === 0 ? (
                  <p>
                    No lessons created for this
                    module.
                  </p>
                ) : (
                  lessons.map((lesson) => (

                    <div
                      key={lesson._id}
                      className="lesson-item"
                    >

                      <div>

                        <div className="lesson-number">
                          {lesson.order}
                        </div>

                        <div>

                          <h4>
                            {lesson.title}
                          </h4>

                          <p>
                            {lesson.description ||
                              "No description"}
                          </p>

                        </div>

                      </div>

                      <div className="lesson-actions">

                        <span className="content-type-badge">
                          {lesson.contentType}
                        </span>

                        <span
                          className={`programme-status ${
                            lesson.isPublished
                              ? "status-approved"
                              : "status-pending"
                          }`}
                        >
                          {lesson.isPublished
                            ? "Published"
                            : "Draft"}
                        </span>

                        <button
                          type="button"
                          className={
                            lesson.isPublished
                              ? "danger-button"
                              : "primary-button"
                          }
                          onClick={() =>
                            handleToggleLessonPublish(
                              lesson._id
                            )
                          }
                        >
                          {lesson.isPublished
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                      </div>

                    </div>

                  ))
                )}

              </div>
            </div>
          )}

          <div className="content-box">

            <h3>Assignments</h3>

            <form
              className="content-form"
              onSubmit={handleCreateAssignment}
            >

              <input
                type="text"
                name="title"
                placeholder="Assignment Title"
                value={assignmentForm.title}
                onChange={handleAssignmentChange}
                required
              />

              <input
                type="date"
                name="dueDate"
                value={assignmentForm.dueDate}
                onChange={handleAssignmentChange}
                required
              />

              <input
                type="number"
                name="totalMarks"
                placeholder="Total Marks"
                value={assignmentForm.totalMarks}
                onChange={handleAssignmentChange}
                min="1"
                required
              />

              <textarea
                name="description"
                placeholder="Assignment Description / Instructions"
                value={assignmentForm.description}
                onChange={handleAssignmentChange}
                required
              />

              <button
                type="submit"
                className="primary-button"
              >
                Create Assignment
              </button>

            </form>

            <div className="lesson-list">

              {assignments.length === 0 ? (
                <p>
                  No assignments created yet.
                </p>
              ) : (
                assignments.map((assignment) => (

                  <div
                    key={assignment._id}
                    className="lesson-item"
                  >

                    <div>

                      <div className="lesson-number">
                        ✓
                      </div>

                      <div>

                        <h4>
                          {assignment.title}
                        </h4>

                        <p>
                          {assignment.description ||
                            "No instructions provided"}
                        </p>

                        <p>
                          <strong>
                            Due Date:
                          </strong>{" "}
                          {assignment.dueDate
                            ? new Date(
                                assignment.dueDate
                              ).toLocaleDateString()
                            : "Not set"}
                        </p>

                        <p>
                          <strong>
                            Marks:
                          </strong>{" "}
                          {assignment.maxMarks}
                        </p>

                      </div>

                    </div>

                    <div className="lesson-actions">

                      <span
                        className={`programme-status ${
                          assignment.isPublished
                            ? "status-approved"
                            : "status-pending"
                        }`}
                      >
                        {assignment.isPublished
                          ? "Published"
                          : "Draft"}
                      </span>

                      <button
                        type="button"
                        className={
                          assignment.isPublished
                            ? "danger-button"
                            : "primary-button"
                        }
                        onClick={() =>
                          handleToggleAssignmentPublish(
                            assignment._id
                          )
                        }
                      >
                        {assignment.isPublished
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                    </div>

                  </div>

                ))
              )}

            </div>
          </div>

          <div className="content-box">

            <h3>Quizzes</h3>

            <form
              className="content-form"
              onSubmit={handleCreateQuiz}
            >

              <input
                type="text"
                name="title"
                placeholder="Quiz Title"
                value={quizForm.title}
                onChange={handleQuizChange}
                required
              />

              <input
                type="number"
                name="duration"
                placeholder="Duration in minutes"
                value={quizForm.duration}
                onChange={handleQuizChange}
                min="1"
              />

              <input
                type="number"
                name="totalMarks"
                placeholder="Total Marks"
                value={quizForm.totalMarks}
                onChange={handleQuizChange}
                min="1"
              />

              <input
                type="number"
                name="passingMarks"
                placeholder="Passing Marks"
                value={quizForm.passingMarks}
                onChange={handleQuizChange}
                min="1"
              />

              <textarea
                name="description"
                placeholder="Quiz Description"
                value={quizForm.description}
                onChange={handleQuizChange}
              />

              <button
                type="submit"
                className="primary-button"
              >
                Create Quiz
              </button>

            </form>

            <div className="lesson-list">

              {quizzes.length === 0 ? (
                <p>
                  No quizzes created yet.
                </p>
              ) : (
                quizzes.map((quiz) => (

                  <div
                    key={quiz._id}
                    className="content-box"
                  >

                    {/* QUIZ HEADER */}

                    <div className="content-header">

                      <div>

                        <h4>
                          {quiz.title}
                        </h4>

                        <p>
                          {quiz.description ||
                            "No description"}
                        </p>

                      </div>

                      <div className="lesson-actions">

                        <span className="content-type-badge">
                          {quiz.questions?.length || 0}{" "}
                          Questions
                        </span>

                        <span
                          className={`programme-status ${
                            quiz.isPublished
                              ? "status-approved"
                              : "status-pending"
                          }`}
                        >
                          {quiz.isPublished
                            ? "Published"
                            : "Draft"}
                        </span>

                        <button
                          type="button"
                          className={
                            quiz.isPublished
                              ? "danger-button"
                              : "primary-button"
                          }
                          onClick={() =>
                            handleToggleQuizPublish(
                              quiz._id
                            )
                          }
                        >
                          {quiz.isPublished
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                      </div>

                    </div>

                    {quiz.isPublished ? (
                      <div className="dashboard-message success">
                        This quiz is published and available
                        to trainees. Unpublish it if you need
                        to modify its questions.
                      </div>
                    ) : (
 
                      <div className="content-box">

                        <h4>
                          Add Question
                        </h4>

                        <input
                          type="text"
                          name="question"
                          placeholder="Question"
                          value={
                            questionForm.question
                          }
                          onChange={
                            handleQuestionChange
                          }
                        />

                        <input
                          type="text"
                          name="optionA"
                          placeholder="Option A"
                          value={
                            questionForm.optionA
                          }
                          onChange={
                            handleQuestionChange
                          }
                        />

                        <input
                          type="text"
                          name="optionB"
                          placeholder="Option B"
                          value={
                            questionForm.optionB
                          }
                          onChange={
                            handleQuestionChange
                          }
                        />

                        <input
                          type="text"
                          name="optionC"
                          placeholder="Option C"
                          value={
                            questionForm.optionC
                          }
                          onChange={
                            handleQuestionChange
                          }
                        />

                        <input
                          type="text"
                          name="optionD"
                          placeholder="Option D"
                          value={
                            questionForm.optionD
                          }
                          onChange={
                            handleQuestionChange
                          }
                        />

                        <select
                          name="correctAnswer"
                          value={
                            questionForm.correctAnswer
                          }
                          onChange={
                            handleQuestionChange
                          }
                        >

                          <option value="A">
                            Correct: A
                          </option>

                          <option value="B">
                            Correct: B
                          </option>

                          <option value="C">
                            Correct: C
                          </option>

                          <option value="D">
                            Correct: D
                          </option>

                        </select>

                        <input
                          type="number"
                          name="marks"
                          placeholder="Marks"
                          value={
                            questionForm.marks
                          }
                          onChange={
                            handleQuestionChange
                          }
                          min="1"
                        />

                        <button
                          type="button"
                          className="primary-button"
                          onClick={() =>
                            handleAddQuestion(
                              quiz._id
                            )
                          }
                        >
                          Add Question
                        </button>

                      </div>
                    )}

                  </div>

                ))
              )}

            </div>

          </div>

        </section>
      )}

    </div>
  );
}

export default TrainerDashboard;