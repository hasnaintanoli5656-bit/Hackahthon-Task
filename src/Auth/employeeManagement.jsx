import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../components/Sidebar";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    department: "",
    designation: "",
  });

  const loadEmployees = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "employee"));

      const snapshot = await getDocs(q);

      setEmployees(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })),
      );
    } catch (error) {
      console.error(error);
      toast.error("Employees load nahi hue");
    } finally {
      setLoading(false);
    }
  };

  
useEffect(() => {
  const q = query(
    collection(db, "users"),
    where("role", "==", "employee")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const employeeList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setEmployees(employeeList);
      setLoading(false);
    },
    (error) => {
      console.error("Employees load error:", error);
      toast.error("Employees load nahi hue");
      setLoading(false);
    }
  );

  return () => unsubscribe();
}, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.department.trim() ||
      !form.designation.trim()
    ) {
      toast.error("Saari fields fill karein");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Please login first");
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "employeeRequests"), {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
        requestedBy: auth.currentUser.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast.success("Employee request submit ho gayi!");

      setForm({
        fullName: "",
        email: "",
        department: "",
        designation: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Request save nahi hui. Firestore rules check karein.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm(
      "Kya aap is employee ka Firestore profile delete karna chahte hain?",
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "users", employeeId));

      setEmployees((previous) =>
        previous.filter((employee) => employee.id !== employeeId),
      );

      toast.success("Employee profile delete ho gayi");
    } catch (error) {
      console.error(error);
      toast.error("Delete nahi hua. Permissions check karein.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6">
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8">
              <p className="text-sm text-blue-600">HR / Employee Management</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Employee Management
              </h1>
              <p className="mt-2 text-slate-500">
                Manage employee information and requests.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Add Employee</h2>
                <p className="mb-6 mt-2 text-sm text-slate-500">
                  Submit a new employee request.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    ["fullName", "Full Name", "Enter employee name"],
                    ["email", "Email Address", "employee@example.com"],
                    ["department", "Department", "e.g. IT"],
                    ["designation", "Designation", "e.g. Frontend Developer"],
                  ].map(([name, label, placeholder]) => (
                    <div key={name}>
                      <label className="mb-2 block text-sm font-medium">
                        {label}
                      </label>
                      <input
                        name={name}
                        type={name === "email" ? "email" : "text"}
                        value={form[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Submitting..." : "Submit Employee Request"}
                  </button>
                </form>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Employees</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Existing employee profiles from Firestore.
                    </p>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                    {employees.length} Employees
                  </span>
                </div>

                {loading ? (
                  <p className="py-8 text-center text-slate-500">
                    Loading employees...
                  </p>
                ) : employees.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-slate-500">
                    No employee profiles found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500">
                          <th className="px-3 py-3">Name</th>
                          <th className="px-3 py-3">Email</th>
                          <th className="px-3 py-3">Department</th>
                          <th className="px-3 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((employee) => (
                          <tr
                            key={employee.id}
                            className="border-b last:border-0"
                          >
                            <td className="px-3 py-4 font-medium">
                              {employee.fullName || employee.name || "—"}
                            </td>
                            <td className="px-3 py-4">
                              {employee.email || "—"}
                            </td>
                            <td className="px-3 py-4">
                              {employee.department || "—"}
                            </td>
                            <td className="px-3 py-4">
                              <button
                                onClick={() => handleDelete(employee.id)}
                                className="rounded-md bg-red-50 px-3 py-2 font-medium text-red-600 hover:bg-red-100"
                              >
                                Delete
                              </button>
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

export default EmployeeManagement;
