import { useEffect, useState } from "react";

import api from "../services/api";

import { useAuth } from "../context/AuthContext";



function TraineeDashboard() {

  const { user, logout } = useAuth();
  const [programmes, setProgrammes] = useState([]);

  const [applications, setApplications] = useState([]);

  const [enrollments, setEnrollments] = useState([]);

  const [assignments, setAssignments] = useState([]);

  const [quizzes, setQuizzes] = useState([]);

  const [eligibilityStatus, setEligibilityStatus] =
    useState({});

  const [eligibilityLoading, setEligibilityLoading] =
    useState({});

  const [profileForm, setProfileForm] = useState({
    qualification: user?.qualification || "",
    experienceLevel: user?.experienceLevel || "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);



  const [selectedProgramme, setSelectedProgramme] =

    useState(null);



  const [submissionText, setSubmissionText] =

    useState("");



  const [selectedQuiz, setSelectedQuiz] =

    useState(null);



  const [quizAnswers, setQuizAnswers] =

    useState({});



  const [quizResult, setQuizResult] =

    useState(null);



  const [message, setMessage] =

    useState("");



  const [error, setError] =

    useState("");



  const [loading, setLoading] =

    useState(true);
  const [learningData, setLearningData] =

    useState(null);



  const [learningLoading, setLearningLoading] =

    useState(false);
  const [completionStatus, setCompletionStatus] =

    useState(null);



  const [completionLoading, setCompletionLoading] =

    useState(false);
  const [certificateStatus, setCertificateStatus] =

    useState(null);



  const [certificates, setCertificates] =

    useState([]);



  const [certificateLoading, setCertificateLoading] =

    useState(false);
  const loadData = async () => {

    try {

      setLoading(true);

      setError("");



      const [

        programmesResponse,

        applicationsResponse,

        enrollmentsResponse,

        assignmentsResponse,

        quizzesResponse,

      ] = await Promise.all([

        api.get("/programmes/published"),

        api.get("/applications/my"),

        api.get("/enrollments/my"),

        api.get("/assessments/my/assignments"),

        api.get("/assessments/my/quizzes"),

      ]);



      setProgrammes(

        programmesResponse.data.programmes || []

      );



      setApplications(

        applicationsResponse.data.applications || []

      );



      setEnrollments(

        enrollmentsResponse.data.enrollments || []

      );



      setAssignments(

        assignmentsResponse.data.assignments || []

      );



      setQuizzes(

        quizzesResponse.data.quizzes || []

      );

    } catch (error) {

      console.error(error);



      setError(

        error.response?.data?.message ||

          "Failed to load dashboard"

      );

    } finally {

      setLoading(false);

    }

  };

  const loadProfile = async () => {
    try {
      setProfileLoading(true);

      const response = await api.get("/users/profile");
      const profile = response.data.user || response.data || {};

      setProfileForm({
        qualification: profile.qualification || "",
        experienceLevel: profile.experienceLevel || "",
      });
    } catch (error) {
      console.error("Load profile error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load trainee profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.qualification) {
      setError("Please select your qualification.");
      return;
    }

    if (!profileForm.experienceLevel) {
      setError("Please select your experience level.");
      return;
    }

    try {
      setProfileSaving(true);
      setError("");
      setMessage("");

      const response = await api.put("/users/profile", {
        qualification: profileForm.qualification,
        experienceLevel: profileForm.experienceLevel,
      });

      setMessage(
        response.data.message ||
          "Profile updated successfully."
      );

      await loadProfile();
      setEligibilityStatus({});
    } catch (error) {
      console.error("Save profile error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {

    loadData();
    loadCertificates();
    loadProfile();

  }, []);

  const isEnrolled = (programmeId) => {

    return enrollments.some(

      (item) =>

        item.programme?._id === programmeId ||

        item.programme === programmeId

    );

  };
  const getApplication = (programmeId) => {

    return applications.find(

      (item) =>

        item.programme?._id === programmeId ||

        item.programme === programmeId

    );

  };

  const checkEligibility = async (programmeId) => {
    try {
      setError("");
      setMessage("");

      setEligibilityLoading((previous) => ({
        ...previous,
        [programmeId]: true,
      }));

      const response = await api.get(
        `/programmes/${programmeId}/eligibility`
      );

      setEligibilityStatus((previous) => ({
        ...previous,
        [programmeId]: response.data,
      }));
    } catch (error) {
      console.error("Check eligibility error:", error);

      setEligibilityStatus((previous) => ({
        ...previous,
        [programmeId]: {
          success: false,
          eligible: false,
          message:
            error.response?.data?.message ||
            "Failed to check programme eligibility",
        },
      }));
    } finally {
      setEligibilityLoading((previous) => ({
        ...previous,
        [programmeId]: false,
      }));
    }
  };
  const applyForProgramme = async (

    programmeId

  ) => {

    try {

      setError("");

      setMessage("");
      await api.post("/applications", {

        programmeId,

      });
      setMessage(

        "Application submitted successfully."

      );



      await loadData();

    } catch (error) {

      setError(

        error.response?.data?.message ||

          "Failed to submit application"

      );

    }

  };
  const submitAssignment = async (

    assignmentId

  ) => {

    try {

      if (!submissionText.trim()) {

        setError(

          "Please write your assignment submission."

        );

        return;

      }



      setError("");

      setMessage("");



      await api.post(

        `/assessments/assignments/${assignmentId}/submit`,

        {

          content: submissionText,

          fileUrl: "",

        }

      );



      setSubmissionText("");



      setMessage(

        "Assignment submitted successfully."

      );
      await loadData();



      if (selectedProgramme?._id) {

        await loadCompletionStatus(

          selectedProgramme._id

        );



        await loadCertificateStatus(

          selectedProgramme._id

        );

      }

    } catch (error) {

      setError(

        error.response?.data?.message ||

          "Failed to submit assignment"

      );

    }

  };
  const startQuiz = (quiz) => {

    setSelectedQuiz(quiz);

    setQuizAnswers({});

    setQuizResult(null);

  };



  const handleAnswerChange = (

    questionId,

    answer

  ) => {

    setQuizAnswers((previous) => ({

      ...previous,

      [questionId]: Number(answer),

    }));

  };
  const submitQuiz = async () => {

    try {

      if (!selectedQuiz) {

        return;

      }
      const answers = Object.entries(

        quizAnswers

      ).map(

        ([questionId, selectedAnswer]) => ({

          questionId,

          selectedAnswer,

        })

      );



      setError("");

      setMessage("");



      const response = await api.post(

        `/assessments/quizzes/${selectedQuiz._id}/submit`,

        {

          answers,

        }

      );



      setQuizResult(

        response.data.result

      );



      setMessage(

        "Quiz submitted successfully."

      );



      await loadData();



      const programmeId =

        selectedQuiz.programme?._id ||

        selectedQuiz.programme;



      if (programmeId) {

        await loadCompletionStatus(

          programmeId

        );



        await loadCertificateStatus(

          programmeId

        );

      }

    } catch (error) {

      setError(

        error.response?.data?.message ||

          "Failed to submit quiz"

      );

    }

  };
  const openLMS = async (programme) => {

    try {

      setSelectedProgramme(programme);



      setError("");

      setMessage("");



      setLearningLoading(true);



      const response = await api.get(

        `/trainer/learning/${programme._id}`

      );



      setLearningData(response.data);



      await loadCompletionStatus(

        programme._id

      );



      await loadCertificateStatus(

        programme._id

      );

    } catch (error) {

      console.error(

        "Open LMS error:",

        error

      );



      setLearningData(null);



      setError(

        error.response?.data?.message ||

          "Failed to load learning content"

      );

    } finally {

      setLearningLoading(false);

    }

  };
  const closeLMS = () => {

    setSelectedProgramme(null);

    setLearningData(null);

    setCompletionStatus(null);

    setCertificateStatus(null);

  };
  const loadCompletionStatus = async (

    programmeId

  ) => {

    try {

      setCompletionLoading(true);



      const response = await api.get(

        `/completion/programmes/${programmeId}/status`

      );



      setCompletionStatus(

        response.data.completion || null

      );

    } catch (error) {

      console.error(

        "Completion status error:",

        error

      );



      setCompletionStatus(null);

    } finally {

      setCompletionLoading(false);

    }

  };
  const markLessonComplete = async (

    programmeId,

    lessonId

  ) => {

    try {

      setError("");

      setMessage("");



      await api.post(

        `/completion/programmes/${programmeId}/lessons/${lessonId}/complete`

      );

      await loadCompletionStatus(programmeId);



      setMessage(

        "Lesson marked as completed."

      );

      await loadCertificateStatus(

        programmeId

      );

    } catch (error) {

      console.error(

        "Mark lesson complete error:",

        error

      );



      setError(

        error.response?.data?.message ||

          "Failed to mark lesson complete"

      );

    }

  };
  const loadCertificateStatus = async (

    programmeId

  ) => {

    try {

      const response = await api.get(

        `/certificates/status/${programmeId}`

      );



      setCertificateStatus(

        response.data || null

      );

    } catch (error) {

      console.error(

        "Certificate status error:",

        error

      );



      setCertificateStatus(null);

    }

  };
  const loadCertificates = async () => {

    try {

      const response = await api.get(

        "/certificates/my"

      );



      setCertificates(

        response.data.certificates || []

      );

    } catch (error) {

      console.error(

        "Load certificates error:",

        error

      );

    }

  };
  const generateCertificate = async (

    programmeId

  ) => {

    try {

      setCertificateLoading(true);



      setError("");

      setMessage("");



      const response = await api.post(

        `/certificates/generate/${programmeId}`

      );



      setCertificateStatus({

        ...(certificateStatus || {}),

        eligible: true,

        certificate:

          response.data.certificate,

        completion:

          response.data.completion,

      });



      setMessage(

        "Certificate generated successfully."

      );



      await loadCertificates();

    } catch (error) {

      console.error(

        "Generate certificate error:",

        error

      );



      setError(

        error.response?.data?.message ||

          "Failed to generate certificate"

      );



      await loadCertificateStatus(

        programmeId

      );

    } finally {

      setCertificateLoading(false);

    }

  };
  const openCertificateVerification = (

    certificate

  ) => {

    if (

      certificate?.verificationUrl

    ) {

      window.open(

        certificate.verificationUrl,

        "_blank",

        "noopener,noreferrer"

      );

    }

  };
  const isLessonCompleted = (

    lessonId

  ) => {

    if (!completionStatus) {

      return false;

    }



    const completedLessons =

      completionStatus.completedLessons || [];



    return completedLessons.some(

      (item) => {

        const id =

          item.lesson?._id ||

          item.lesson ||

          item;



        return (

          id?.toString() ===

          lessonId?.toString()

        );

      }

    );

  };
  const getCompletionPercentage = () => {

    if (!completionStatus) {

      return 0;

    }



    if (

      typeof completionStatus.percentage ===

      "number"

    ) {

      return completionStatus.percentage;

    }



    const lessonTotal =

      completionStatus.lessons?.total || 0;



    const lessonCompleted =

      completionStatus.lessons?.completed || 0;



    const assignmentTotal =

      completionStatus.assignments?.total || 0;



    const assignmentCompleted =

      completionStatus.assignments?.completed ||

      0;



    const quizTotal =

      completionStatus.quizzes?.total || 0;



    const quizCompleted =

      completionStatus.quizzes?.completed || 0;



    const total =

      lessonTotal +

      assignmentTotal +

      quizTotal;



    const completed =

      lessonCompleted +

      assignmentCompleted +

      quizCompleted;



    if (total === 0) {

      return 0;

    }



    return Math.round(

      (completed / total) * 100

    );

  };
  const isCertificateEligible =

    certificateStatus?.eligible === true;



  const existingProgrammeCertificate =

    certificateStatus?.certificate || null;
  if (loading) {

    return (

      <div className="loading-screen">

        Loading...

      </div>

    );

  }
  const myLearning = enrollments;
  return (

    <div className="admin-dashboard">
      <header className="dashboard-header">

        <div>

          <p className="dashboard-label">

            TRAINEE DASHBOARD

          </p>



          <h1>

            Welcome, {user?.name}

          </h1>



          <p>

            Explore programmes, track

            applications and continue your

            learning.

          </p>

        </div>



        <button

          className="secondary-button"

          onClick={logout}

        >

          Logout

        </button>

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
            <h2>My Profile</h2>
            <p>Update your qualification and experience before applying for programmes.</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="programme-form">
          <div>
            <label>Qualification</label>
            <select
              name="qualification"
              value={profileForm.qualification}
              onChange={handleProfileChange}
              disabled={profileLoading || profileSaving}
              required
            >
              <option value="">Select qualification</option>
              <option value="1st_year">1st Year</option>
              <option value="2nd_year">2nd Year</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label>Experience Level</label>
            <select
              name="experienceLevel"
              value={profileForm.experienceLevel}
              onChange={handleProfileChange}
              disabled={profileLoading || profileSaving}
              required
            >
              <option value="">Select experience level</option>
              <option value="beginner">Beginner</option>
              <option value="fresher">Fresher</option>
              <option value="experienced">Experienced</option>
            </select>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={profileLoading || profileSaving}
          >
            {profileSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>
      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>

              Available Programmes

            </h2>



            <p>

              Browse and apply for published

              training programmes.

            </p>

          </div>

        </div>



        {programmes.length === 0 ? (

          <div className="empty-state">

            No programmes available.

          </div>

        ) : (

          <div className="programme-grid">

            {programmes.map(

              (programme) => {

                const application =

                  getApplication(

                    programme._id

                  );



                const enrolled =

                  isEnrolled(

                    programme._id

                  );



                const eligibility =
                  eligibilityStatus[programme._id];

                const isCheckingEligibility =
                  eligibilityLoading[programme._id] === true;

                const qualificationLabels = {
                  "1st_year": "1st Year",
                  "2nd_year": "2nd Year",
                  graduate: "Graduate",
                  postgraduate: "Postgraduate",
                };

                const experienceLabels = {
                  beginner: "Beginner",
                  fresher: "Fresher",
                  experienced: "Experienced",
                };

                return (

                  <div

                    className="programme-card"

                    key={programme._id}

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



                      <p>

                        Category:{" "}

                        {programme.category}

                      </p>



                      <p>

                        Duration:{" "}

                        {programme.duration} days

                      </p>

                      <p>
                        Minimum Qualification:{" "}
                        {qualificationLabels[
                          programme.minimumQualification
                        ] ||
                          programme.minimumQualification ||
                          "Not specified"}
                      </p>

                      <p>
                        Experience:{" "}
                        {Array.isArray(
                          programme.eligibleExperienceLevels
                        ) &&
                        programme.eligibleExperienceLevels.length > 0
                          ? programme.eligibleExperienceLevels
                              .map(
                                (level) =>
                                  experienceLabels[level] || level
                              )
                              .join(", ")
                          : "Not specified"}
                      </p>

                    </div>

                    {enrolled ? (
                      <button
                        className="primary-button"
                        onClick={() =>
                          openLMS(programme)
                        }
                      >
                        Open LMS
                      </button>
                    ) : application ? (
                      <div
                        className={`application-status-badge ${application.status}`}
                      >
                        Application:{" "}
                        {application.status}
                      </div>
                    ) : eligibility?.eligible === true ? (
                      <div>
                        <div className="dashboard-message success">
                          ✓ You are eligible for this programme.
                        </div>

                        <button
                          className="primary-button"
                          onClick={() =>
                            applyForProgramme(programme._id)
                          }
                        >
                          Apply Now
                        </button>
                      </div>
                    ) : eligibility ? (
                      <div>
                        <div className="dashboard-message error">
                          {eligibility.message ||
                            "You are not eligible for this programme."}
                        </div>

                        <button
                          className="secondary-button"
                          disabled={isCheckingEligibility}
                          onClick={() =>
                            checkEligibility(programme._id)
                          }
                        >
                          {isCheckingEligibility
                            ? "Checking..."
                            : "Check Again"}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="primary-button"
                        disabled={isCheckingEligibility}
                        onClick={() =>
                          checkEligibility(programme._id)
                        }
                      >
                        {isCheckingEligibility
                          ? "Checking..."
                          : "Check Eligibility"}
                      </button>
                    )}

                  </div>

                );

              }

            )}

          </div>

        )}

      </section>
      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h2>

              My Learning

            </h2>



            <p>

              LMS content is available only

              after application approval.

            </p>

          </div>

        </div>



        {myLearning.length === 0 ? (

          <div className="empty-state">

            Your LMS will unlock after an

            Institute Admin approves your

            application.

          </div>

        ) : (

          <div className="learning-list">

            {myLearning.map(

              (enrollment) => (

                <div

                  className="learning-card"

                  key={enrollment._id}

                >

                  <div>

                    <span className="programme-code">

                      {

                        enrollment.programme

                          ?.code

                      }

                    </span>



                    <h3>

                      {

                        enrollment.programme

                          ?.title

                      }

                    </h3>



                    <p>

                      Enrolled on{" "}

                      {new Date(

                        enrollment.enrolledAt

                      ).toLocaleDateString()}

                    </p>



                    <p>

                      Status:{" "}

                      {enrollment.status}

                    </p>

                  </div>



                  <button

                    className="primary-button"

                    onClick={() =>

                      openLMS(

                        enrollment.programme

                      )

                    }

                  >

                    Continue Learning

                  </button>

                </div>

              )

            )}

          </div>

        )}

      </section>
      {selectedProgramme && (

        <section className="dashboard-section lms-section">



          <div className="section-heading">

            <div>

              <span className="programme-code">

                {selectedProgramme.code}

              </span>



              <h2>

                {selectedProgramme.title}

              </h2>



              <p>

                Your enrolled learning

                content.

              </p>

            </div>



            <button

              className="secondary-button"

              onClick={closeLMS}

            >

              Close LMS

            </button>

          </div>



          {learningLoading ? (

            <div className="empty-state">

              Loading learning content...

            </div>

          ) : (

            <>
              <div className="lms-access-message">

                ✓ You are enrolled in this

                programme. LMS access is enabled.

              </div>
              <div className="dashboard-section">



                <div className="section-heading">

                  <div>

                    <h2>

                      Course Progress

                    </h2>



                    <p>

                      Complete all required

                      learning activities to

                      unlock your certificate.

                    </p>

                  </div>

                </div>



                {completionLoading ? (

                  <div className="empty-state">

                    Checking completion...

                  </div>

                ) : completionStatus ? (

                  <div className="learning-card">



                    <div>

                      <h3>

                        Overall Progress

                      </h3>



                      <p>

                        Progress:{" "}

                        {getCompletionPercentage()}%

                      </p>



                      <p>

                        Lessons:{" "}

                        {

                          completionStatus

                            .lessons?.completed ||

                          0

                        }{" "}

                        /{" "}

                        {

                          completionStatus

                            .lessons?.total ||

                          0

                        }

                      </p>



                      <p>

                        Assignments:{" "}

                        {

                          completionStatus

                            .assignments?.completed ||

                          0

                        }{" "}

                        /{" "}

                        {

                          completionStatus

                            .assignments?.total ||

                          0

                        }

                      </p>



                      <p>

                        Quizzes:{" "}

                        {

                          completionStatus

                            .quizzes?.completed ||

                          0

                        }{" "}

                        /{" "}

                        {

                          completionStatus

                            .quizzes?.total ||

                          0

                        }

                      </p>

                    </div>



                  </div>

                ) : (

                  <div className="empty-state">

                    Completion status is

                    currently unavailable.

                  </div>

                )}



              </div>
              <div className="dashboard-section">



                <div className="section-heading">

                  <div>

                    <h2>

                      Course Content

                    </h2>



                    <p>

                      Complete each published

                      lesson.

                    </p>

                  </div>

                </div>



                {!learningData?.modules ||

                learningData.modules.length ===

                  0 ? (

                  <div className="empty-state">

                    No published learning

                    content is available yet.

                  </div>

                ) : (

                  <div className="learning-list">



                    {learningData.modules.map(

                      (module) => (

                        <div

                          className="learning-card"

                          key={module._id}

                        >



                          <div>

                            <span className="programme-code">

                              Module{" "}

                              {module.order}

                            </span>



                            <h3>

                              {module.title}

                            </h3>



                            {module.description && (

                              <p>

                                {

                                  module.description

                                }

                              </p>

                            )}

                          </div>



                          <div>

                            {module.lessons &&

                            module.lessons.length >

                              0 ? (

                              <div className="assignment-list">



                                {module.lessons.map(

                                  (lesson) => {

                                    const completed =

                                      isLessonCompleted(

                                        lesson._id

                                      );



                                    return (

                                      <div

                                        className="assignment-card"

                                        key={

                                          lesson._id

                                        }

                                      >



                                        <div>

                                          <span className="programme-code">

                                            Lesson{" "}

                                            {lesson.order}

                                          </span>



                                          <h3>

                                            {

                                              lesson.title

                                            }

                                          </h3>



                                          {lesson.description && (

                                            <p>

                                              {

                                                lesson.description

                                              }

                                            </p>

                                          )}



                                          <p>

                                            Type:{" "}

                                            {

                                              lesson.contentType

                                            }

                                          </p>



                                          {lesson.duration >

                                            0 && (

                                            <p>

                                              Duration:{" "}

                                              {

                                                lesson.duration

                                              }{" "}

                                              minutes

                                            </p>

                                          )}

                                        </div>



                                        <div>



                                          {lesson.contentUrl && (

                                            <p>

                                              <a

                                                href={

                                                  lesson.contentUrl

                                                }

                                                target="_blank"

                                                rel="noreferrer"

                                              >

                                                Open Lesson Content

                                              </a>

                                            </p>

                                          )}



                                          {lesson.textContent && (

                                            <div>

                                              <p>

                                                {

                                                  lesson.textContent

                                                }

                                              </p>

                                            </div>

                                          )}



                                          {completed ? (

                                            <div className="submitted-box">

                                              ✓ Lesson Completed

                                            </div>

                                          ) : (

                                            <button

                                              className="primary-button"

                                              onClick={() =>

                                                markLessonComplete(

                                                  selectedProgramme._id,

                                                  lesson._id

                                                )

                                              }

                                            >

                                              Mark as Complete

                                            </button>

                                          )}



                                        </div>



                                      </div>

                                    );

                                  }

                                )}



                              </div>

                            ) : (

                              <div className="empty-state">

                                No lessons available

                                in this module.

                              </div>

                            )}

                          </div>



                        </div>

                      )

                    )}



                  </div>

                )}



              </div>
              <div className="dashboard-section">



                <div className="section-heading">

                  <div>

                    <h2>

                      Certificate

                    </h2>



                    <p>

                      Your certificate becomes

                      available after completing

                      all required activities.

                    </p>

                  </div>

                </div>



                {existingProgrammeCertificate ? (

                  <div className="learning-card">



                    <div>

                      <span className="programme-code">

                        CERTIFICATE

                      </span>



                      <h3>

                        Certificate Generated

                      </h3>



                      <p>

                        Certificate Number:{" "}

                        {

                          existingProgrammeCertificate

                            .certificateNumber

                        }

                      </p>



                      {existingProgrammeCertificate

                        .issuedAt && (

                        <p>

                          Issued on:{" "}

                          {new Date(

                            existingProgrammeCertificate

                              .issuedAt

                          ).toLocaleDateString()}

                        </p>

                      )}

                    </div>



                    <div>

                      {existingProgrammeCertificate

                        .verificationUrl && (

                        <button

                          className="primary-button"

                          onClick={() =>

                            openCertificateVerification(

                              existingProgrammeCertificate

                            )

                          }

                        >

                          Verify Certificate

                        </button>

                      )}

                    </div>



                  </div>

                ) : isCertificateEligible ? (

                  <div className="learning-card">



                    <div>

                      <h3>

                        🎓 You are eligible!

                      </h3>



                      <p>

                        You have completed all

                        required programme

                        requirements.

                      </p>

                    </div>



                    <button

                      className="primary-button"

                      disabled={

                        certificateLoading

                      }

                      onClick={() =>

                        generateCertificate(

                          selectedProgramme._id

                        )

                      }

                    >

                      {certificateLoading

                        ? "Generating..."

                        : "Generate Certificate"}

                    </button>



                  </div>

                ) : (

                  <div className="empty-state">



                    <p>

                      Certificate is not

                      unlocked yet.

                    </p>



                    {completionStatus && (

                      <p>

                        Current progress:{" "}

                        {getCompletionPercentage()}%

                      </p>

                    )}



                    <p>

                      Complete all lessons,

                      assignments and required

                      quizzes.

                    </p>



                  </div>

                )}



              </div>



            </>

          )}



        </section>

      )}
      <section className="dashboard-section">



        <div className="section-heading">

          <div>

            <h2>

              My Certificates

            </h2>



            <p>

              Certificates issued to you.

            </p>

          </div>

        </div>



        {certificates.length === 0 ? (

          <div className="empty-state">

            No certificates generated yet.

          </div>

        ) : (

          <div className="learning-list">



            {certificates.map(

              (certificate) => (

                <div

                  className="learning-card"

                  key={certificate._id}

                >



                  <div>

                    <span className="programme-code">

                      {

                        certificate

                          .certificateNumber

                      }

                    </span>



                    <h3>

                      {

                        certificate.programme

                          ?.title

                      }

                    </h3>



                    <p>

                      Issued on:{" "}

                      {new Date(

                        certificate.issuedAt

                      ).toLocaleDateString()}

                    </p>

                  </div>



                  <button

                    className="primary-button"

                    onClick={() =>

                      openCertificateVerification(

                        certificate

                      )

                    }

                  >

                    Verify Certificate

                  </button>



                </div>

              )

            )}



          </div>

        )}



      </section>

      {assignments.length > 0 && (

        <section className="dashboard-section">



          <div className="section-heading">

            <div>

              <h2>

                My Assignments

              </h2>



              <p>

                Complete and submit your

                assignments.

              </p>

            </div>

          </div>



          <div className="assignment-list">



            {assignments.map(

              (assignment) => (

                <div

                  className="assignment-card"

                  key={assignment._id}

                >



                  <div>

                    <span className="programme-code">

                      {

                        assignment

                          .programme?.code

                      }

                    </span>



                    <h3>

                      {assignment.title}

                    </h3>



                    <p>

                      {

                        assignment.description

                      }

                    </p>



                    {assignment.module && (

                      <p>

                        Module:{" "}

                        {

                          assignment.module

                            .title

                        }

                      </p>

                    )}



                    <p>

                      Max Marks:{" "}

                      {assignment.maxMarks}

                    </p>



                    {assignment.dueDate && (

                      <p>

                        Due:{" "}

                        {new Date(

                          assignment.dueDate

                        ).toLocaleDateString()}

                      </p>

                    )}



                  </div>



                  <div className="assignment-submit">



                    {assignment.submission ? (

                      <div className="submitted-box">

                        ✓ Submitted on{" "}

                        {assignment.submission

                          .submittedAt &&

                          new Date(

                            assignment

                              .submission

                              .submittedAt

                          ).toLocaleDateString()}

                      </div>

                    ) : (

                      <>

                        <textarea

                          placeholder="Write your assignment submission..."

                          value={

                            submissionText

                          }

                          onChange={(

                            event

                          ) =>

                            setSubmissionText(

                              event.target.value

                            )

                          }

                        />



                        <button

                          className="primary-button"

                          onClick={() =>

                            submitAssignment(

                              assignment._id

                            )

                          }

                        >

                          Submit Assignment

                        </button>

                      </>

                    )}



                  </div>



                </div>

              )

            )}



          </div>



        </section>

      )}
      {quizzes.length > 0 && (

        <section className="dashboard-section">



          <div className="section-heading">

            <div>

              <h2>

                My Quizzes

              </h2>



              <p>

                Attempt your programme

                assessments.

              </p>

            </div>

          </div>



          <div className="quiz-list">



            {quizzes.map((quiz) => (

              <div

                className="quiz-card"

                key={quiz._id}

              >



                <span className="programme-code">

                  {quiz.programme?.code}

                </span>



                <h3>

                  {quiz.title}

                </h3>



                <p>

                  {quiz.description}

                </p>



                <p>

                  Questions:{" "}

                  {quiz.questions?.length || 0}

                </p>



                <button

                  className="primary-button"

                  onClick={() =>

                    startQuiz(quiz)

                  }

                >

                  Attempt Quiz

                </button>



              </div>

            ))}



          </div>



        </section>

      )}
      {selectedQuiz && (

        <div className="quiz-overlay">



          <div className="quiz-modal">



            <div className="quiz-modal-header">



              <div>

                <span className="programme-code">

                  Quiz

                </span>



                <h2>

                  {selectedQuiz.title}

                </h2>

              </div>



              <button

                className="secondary-button"

                onClick={() => {

                  setSelectedQuiz(null);

                  setQuizResult(null);

                }}

              >

                Close

              </button>



            </div>



            {quizResult ? (

              <div className="quiz-result">



                <h2>

                  Quiz Completed

                </h2>



                <div className="score-number">

                  {quizResult.score} /{" "}

                  {quizResult.totalMarks}

                </div>



                <p>

                  Score:{" "}

                  {quizResult.percentage}%

                </p>



                <button

                  className="primary-button"

                  onClick={() => {

                    setSelectedQuiz(null);

                    setQuizResult(null);

                  }}

                >

                  Continue

                </button>



              </div>

            ) : (

              <>

                <div className="quiz-questions">



                  {selectedQuiz.questions?.map(

                    (

                      question,

                      index

                    ) => (

                      <div

                        className="quiz-question"

                        key={

                          question._id

                        }

                      >



                        <h3>

                          {index + 1}.{" "}

                          {

                            question.question

                          }

                        </h3>



                        <div className="quiz-options">



                          {question.options?.map(

                            (

                              option,

                              optionIndex

                            ) => (

                              <label

                                key={

                                  optionIndex

                                }

                                className="quiz-option"

                              >



                                <input

                                  type="radio"

                                  name={`question-${question._id}`}

                                  value={

                                    optionIndex

                                  }

                                  checked={

                                    quizAnswers[

                                      question._id

                                    ] ===

                                    optionIndex

                                  }

                                  onChange={(

                                    event

                                  ) =>

                                    handleAnswerChange(

                                      question._id,

                                      event.target.value

                                    )

                                  }

                                />



                                <span>

                                  {option}

                                </span>



                              </label>

                            )

                          )}



                        </div>



                      </div>

                    )

                  )}



                </div>



                <button

                  className="primary-button quiz-submit-button"

                  onClick={submitQuiz}

                >

                  Submit Quiz

                </button>

              </>

            )}



          </div>



        </div>

      )}



    </div>

  );

}



export default TraineeDashboard;
