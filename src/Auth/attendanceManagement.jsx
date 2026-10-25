import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../components/Sidebar";

const AttendanceManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employeeName, setEmployeeName] = useState("");
  const [status, setStatus] = useState("Present");

  const today = new Date().toLocaleDateString("en-CA");

  const loadAttendance = async () => {
    try {
      const snapshot = await getDocs(collection(db, "attendance"));

      setRecords(
        snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => (b.date || "").localeCompare(a.date || "")),
      );
    } catch (error) {
      console.error(error);
      toast.error("Attendance load nahi hui");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeName.trim()) {
      toast.error("Employee name enter karein");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Please login first");
      return;
    }

    setSaving(true);

    try {
      const existingQuery = query(
        collection(db, "attendance"),
        where("employeeId", "==", auth.currentUser.uid),
        where("date", "==", today),
      );

      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        toast.error("Aaj ki attendance pehle se record hai");
        return;
      }

      await addDoc(collection(db, "attendance"), {
        employeeId: auth.currentUser.uid,
        employeeName: employeeName.trim(),
        date: today,
        status,
        checkInAt: serverTimestamp(),
        checkOutAt: null,
        createdAt: serverTimestamp(),
      });

      toast.success("Attendance save ho gayi!");
      setEmployeeName("");
      await loadAttendance();
    } catch (error) {
      console.error(error);
      toast.error("Attendance save nahi hui. Firestore rules check karein.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6">
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8">
              <p className="text-sm text-blue-600">HCM Lite / Attendance</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Attendance Management
              </h1>
              <p className="mt-2 text-slate-500">
                Record and review daily attendance.
              </p>
            </header>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["Total Records", records.length],
                [
                  "Present",
                  records.filter((r) => r.status === "Present").length,
                ],
                ["Absent", records.filter((r) => r.status === "Absent").length],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Record Attendance</h2>
                <p className="mb-5 mt-2 text-sm text-slate-500">
                  Date: {today}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Employee Name
                    </label>
                    <input
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="Enter employee name"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Attendance Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                    </select>
                  </div>

                  <button
                    disabled={saving}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Attendance"}
                  </button>
                </form>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <h2 className="mb-5 text-xl font-bold">Attendance Records</h2>

                {loading ? (
                  <p className="py-8 text-center text-slate-500">
                    Loading records...
                  </p>
                ) : records.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">
                    No attendance records yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500">
                          <th className="px-3 py-3">Employee</th>
                          <th className="px-3 py-3">Date</th>
                          <th className="px-3 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((record) => (
                          <tr
                            key={record.id}
                            className="border-b last:border-0"
                          >
                            <td className="px-3 py-4 font-medium">
                              {record.employeeName}
                            </td>
                            <td className="px-3 py-4">{record.date}</td>
                            <td className="px-3 py-4">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </div>
          <ToastContainer />
        </div>
      </main>
    </div>
  );
};

export default AttendanceManagement;
