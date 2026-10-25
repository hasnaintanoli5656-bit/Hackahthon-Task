
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    employees: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const employeeQuery = query(
          collection(db, "users"),
          where("role", "==", "employee")
        );

        const leaveQuery = query(
          collection(db, "leaveRequests"),
          where("status", "==", "Pending")
        );

        const [employeesSnapshot, leavesSnapshot] = await Promise.all([
          getDocs(employeeQuery),
          getDocs(leaveQuery),
        ]);

        setStats({
          employees: employeesSnapshot.size,
          pendingLeaves: leavesSnapshot.size,
        });
      } catch (error) {
        console.error("HR dashboard error:", error);
        toast.error("Dashboard data load nahi ho saka.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Logout failed!");
    }
  };

  const currentUser = auth.currentUser;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 bg-slate-900 p-5 text-white">
        <h1 className="text-2xl font-bold">HCM Lite</h1>
        <p className="mt-1 text-sm text-slate-400">HR Panel</p>

        <nav className="mt-8 space-y-2">
          <Link
            to="/hr-dashboard"
            className="block rounded-lg bg-blue-600 px-4 py-3"
          >
            Dashboard
          </Link>
          <Link
            to="/employee-management"
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            Employees
          </Link>
          <Link
            to="/attendance"
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            Attendance
          </Link>
          <Link
            to="/leave-management"
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            Leave Requests
          </Link>
          <Link
            to="/payroll"
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            Payroll
          </Link>
        </nav>

        <button
          onClick={logoutHandler}
          className="mt-10 w-full rounded-lg bg-red-600 px-4 py-3 font-medium hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              HR Dashboard
            </h2>
            <p className="mt-2 text-slate-500">
              Welcome back! Manage your HR operations here.
            </p>
          </div>

          <div className="rounded-lg border bg-white px-4 py-3">
            <p className="text-sm text-slate-500">Logged in as</p>
            <p className="font-medium text-slate-800">
              {currentUser?.email || "HR User"}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="mt-8 text-slate-500">Loading dashboard...</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Employees
              </p>
              <p className="mt-3 text-4xl font-bold text-blue-600">
                {stats.employees}
              </p>
              <Link
                to="/employee-management"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Manage employees →
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Pending Leave Requests
              </p>
              <p className="mt-3 text-4xl font-bold text-amber-600">
                {stats.pendingLeaves}
              </p>
              <Link
                to="/leave-management"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View leave requests →
              </Link>
            </div>
          </div>
        )}

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">
            HR Quick Actions
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/employee-management"
              className="rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
            >
              Employee Management
            </Link>
            <Link
              to="/attendance"
              className="rounded-lg bg-slate-800 px-4 py-3 text-white hover:bg-slate-700"
            >
              Attendance
            </Link>
            <Link
              to="/leave-management"
              className="rounded-lg bg-slate-800 px-4 py-3 text-white hover:bg-slate-700"
            >
              Leave Requests
            </Link>
          </div>
        </section>
      </main>

      <ToastContainer />
    </div>
  );
};

export default HRDashboard;
