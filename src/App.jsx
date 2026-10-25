import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./Auth/signup";
import Login from "./Auth/login";
import Dashboard from "./Auth/dashboard";
import AdminDashboard from "./Auth/adminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import HRManagement from "./Auth/hrManagement";
import EmployeeManagement from "./Auth/employeeManagement";
import AttendanceManagement from "./Auth/attendanceManagement";
import LeaveManagement from "./Auth/leaveManagement";
import PayrollManagement from "./Auth/payrollManagement";
import HRDashboard from "./Auth/hrDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr-management"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <HRManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-management"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <EmployeeManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <AttendanceManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leave-management"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr", "employee"]}>
              <LeaveManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payroll"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <PayrollManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr-dashboard"
          element={
            <ProtectedRoute allowedRoles={["hr"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
