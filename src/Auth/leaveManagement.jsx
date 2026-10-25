import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../components/Sidebar";

const LeaveManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employeeName: "",
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const loadRequests = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      const isEmployee = await (async () => {
        const { getDoc } = await import("firebase/firestore");
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        return userDoc.exists() && userDoc.data().role === "employee";
      })();

      const q = isEmployee
        ? query(
            collection(db, "leaveRequests"),
            where("userId", "==", currentUser.uid),
          )
        : query(collection(db, "leaveRequests"));

      const snapshot = await getDocs(q);

      setRequests(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })),
      );
    } catch (error) {
      console.error(error);
      toast.error("Leave requests load nahi huin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.employeeName.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.reason.trim()
    ) {
      toast.error("Saari fields fill karein");
      return;
    }

    if (form.endDate < form.startDate) {
      toast.error("End date, start date se pehle nahi ho sakti");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Please login first");
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "leaveRequests"), {
        userId: auth.currentUser.uid,
        employeeName: form.employeeName.trim(),
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      toast.success("Leave request submit ho gayi!");

      setForm({
        employeeName: "",
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      await loadRequests();
    } catch (error) {
      console.error(error);
      toast.error("Request save nahi hui. Firestore rules check karein.");
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (requestId, status) => {
    try {
      await updateDoc(doc(db, "leaveRequests", requestId), {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: auth.currentUser.uid,
      });

      setRequests((previous) =>
        previous.map((request) =>
          request.id === requestId ? { ...request, status } : request,
        ),
      );

      toast.success(`Leave request ${status.toLowerCase()} ho gayi`);
    } catch (error) {
      console.error(error);
      toast.error("Status update nahi hua. Permissions check karein.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6">
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8">
              <p className="text-sm text-blue-600">
                HCM Lite / Leave Management
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Leave Management
              </h1>
              <p className="mt-2 text-slate-500">
                Submit leave requests and review their status.
              </p>
            </header>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ["Total Requests", requests.length],
                [
                  "Pending",
                  requests.filter((r) => r.status === "Pending").length,
                ],
                [
                  "Approved",
                  requests.filter((r) => r.status === "Approved").length,
                ],
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
                <h2 className="text-xl font-bold">Apply for Leave</h2>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Employee Name
                    </label>
                    <input
                      name="employeeName"
                      value={form.employeeName}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Leave Type
                    </label>
                    <select
                      name="leaveType"
                      value={form.leaveType}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    >
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Annual Leave</option>
                      <option>Unpaid Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Reason
                    </label>
                    <textarea
                      name="reason"
                      rows="3"
                      value={form.reason}
                      onChange={handleChange}
                      placeholder="Enter leave reason"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />
                  </div>

                  <button
                    disabled={saving}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Submitting..." : "Submit Leave Request"}
                  </button>
                </form>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <h2 className="mb-5 text-xl font-bold">Leave Requests</h2>

                {loading ? (
                  <p className="py-8 text-center text-slate-500">
                    Loading requests...
                  </p>
                ) : requests.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">
                    No leave requests found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">
                              {request.employeeName}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {request.leaveType}
                            </p>
                          </div>

                          <span className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">
                            {request.status}
                          </span>
                        </div>

                        <p className="mt-3 text-sm text-slate-600">
                          {request.startDate} to {request.endDate}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Reason: {request.reason}
                        </p>

                        {request.status === "Pending" && auth.currentUser && (
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() =>
                                handleDecision(request.id, "Approved")
                              }
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleDecision(request.id, "Rejected")
                              }
                              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
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

export default LeaveManagement;
