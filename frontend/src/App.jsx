import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import InstituteAdminDashboard from "./pages/InstituteAdminDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import TraineeDashboard from "./pages/TraineeDashboard";

import TrainerAttendance from "./pages/TrainerAttendance";
import VerifyCertificate from "./pages/VerifyCertificate";
import Certificate from "./pages/Certificate";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ================= PUBLIC CERTIFICATE VERIFICATION ================= */}

      <Route
        path="/verify-certificate/:certificateNumber"
        element={<VerifyCertificate />}
      />
      <Route
  path="/certificate"
  element={<Certificate />}
/>

      {/* ================= SUPER ADMIN ================= */}

      <Route
        path="/dashboard/super_admin"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
            ]}
          >
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= INSTITUTE ADMIN ================= */}

      <Route
        path="/dashboard/institute_admin"
        element={
          <ProtectedRoute
            allowedRoles={[
              "institute_admin",
            ]}
          >
            <InstituteAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= TRAINER ================= */}

      <Route
        path="/dashboard/trainer"
        element={
          <ProtectedRoute
            allowedRoles={[
              "trainer",
            ]}
          >
            <TrainerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= TRAINER ATTENDANCE ================= */}

      <Route
        path="/dashboard/trainer/attendance"
        element={
          <ProtectedRoute
            allowedRoles={[
              "trainer",
            ]}
          >
            <TrainerAttendance />
          </ProtectedRoute>
        }
      />

      {/* ================= TRAINEE ================= */}

      <Route
        path="/dashboard/trainee"
        element={
          <ProtectedRoute
            allowedRoles={[
              "trainee",
            ]}
          >
            <TraineeDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;