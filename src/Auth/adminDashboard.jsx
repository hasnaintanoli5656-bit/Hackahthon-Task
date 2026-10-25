import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  const [company, setCompany] = useState({
    companyName: "",
    companyEmail: "",
    phone: "",
    address: "",
  });

  const [stats, setStats] = useState({
    employees: 0,
    hrManagers: 0,
    attendance: 0,
    pendingLeaves: 0,
  });

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      const [
        employeesSnapshot,
        hrSnapshot,
        attendanceSnapshot,
        leavesSnapshot,
      ] = await Promise.all([
        getDocs(
          query(collection(db, "users"), where("role", "==", "employee")),
        ),
        getDocs(query(collection(db, "users"), where("role", "==", "hr"))),
        getDocs(
          query(collection(db, "attendance"), where("date", "==", todayString)),
        ),
        getDocs(
          query(
            collection(db, "leaveRequests"),
            where("status", "==", "Pending"),
          ),
        ),
      ]);

      setStats({
        employees: employeesSnapshot.size,
        hrManagers: hrSnapshot.size,
        attendance: attendanceSnapshot.size,
        pendingLeaves: leavesSnapshot.size,
      });
    } catch (error) {
      console.error("Dashboard statistics error:", error);
      toast.error("Dashboard statistics load nahi ho sake.");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !company.companyName.trim() ||
      !company.companyEmail.trim() ||
      !company.phone.trim() ||
      !company.address.trim()
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "companies"), {
        companyName: company.companyName.trim(),
        companyEmail: company.companyEmail.trim(),
        phone: company.phone.trim(),
        address: company.address.trim(),
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Company created successfully!");
      setCompany({
        companyName: "",
        companyEmail: "",
        phone: "",
        address: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Company save nahi hui. Firebase rules check karein.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.employees,
      note: "Registered employees",
    },
    {
      title: "HR Managers",
      value: stats.hrManagers,
      note: "Registered HR team",
    },
    {
      title: "Attendance Today",
      value: stats.attendance,
      note: "Today's attendance records",
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves,
      note: "Requests awaiting review",
    },
  ];

  const steps = [
    ["01", "Set up company", "Add your organization details."],
    ["02", "Create HR accounts", "Give HR access to manage employees."],
    ["03", "Add employees", "Build your workforce directory."],
    ["04", "Track attendance", "Manage attendance and leave."],
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-slate-900 p-6 text-white md:block">
        <h1 className="text-2xl font-bold">
          HCM <span className="text-blue-400">Lite</span>
        </h1>

        <p className="mt-2 text-sm text-slate-400">Human Capital Management</p>

        <nav className="mt-10 space-y-3">
          <Link
            to="/admin-dashboard"
            className="block rounded-lg bg-blue-600 px-4 py-3 font-medium"
          >
            Dashboard
          </Link>

          <button
            type="button"
            onClick={() => {
              document.getElementById("company-setup")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="block w-full rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-slate-800"
          >
            Company Setup
          </button>

          <Link
            to="/hr-management"
            className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            HR Management
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

        <div className="absolute bottom-6 left-6 text-sm text-slate-400">
          HCM Lite • Admin Panel
        </div>
      </aside>

      <main className="p-4 sm:p-6 md:ml-60 md:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Admin / Overview</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Admin Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage your company and workforce in one place.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="mt-1 font-semibold">Administrator</p>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{item.title}</p>
              <p className="mt-3 text-3xl font-bold">
                {statsLoading ? "..." : item.value}
              </p>
              <p className="mt-2 text-xs text-slate-400">{item.note}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div
            id="company-setup"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold">Company Setup</h3>
              <p className="mt-1 text-sm text-slate-500">
                Add your organization details to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company Name
                  </label>
                  <input
                    required
                    name="companyName"
                    value={company.companyName}
                    onChange={handleChange}
                    placeholder="e.g. ABC Technologies"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company Email
                  </label>
                  <input
                    required
                    name="companyEmail"
                    type="email"
                    value={company.companyEmail}
                    onChange={handleChange}
                    placeholder="company@example.com"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    required
                    name="phone"
                    type="tel"
                    value={company.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company Address
                  </label>
                  <input
                    required
                    name="address"
                    value={company.address}
                    onChange={handleChange}
                    placeholder="Enter company address"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Saving..." : "Save Company"}
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">Getting Started</h3>
            <p className="mt-2 text-sm text-slate-500">
              Follow these steps to set up your organization.
            </p>

            <div className="mt-6 space-y-5">
              {steps.map(([number, title, description]) => (
                <div key={number} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                    {number}
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-slate-400">
          HCM Lite · Workforce Management System
        </p>
      </main>
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
