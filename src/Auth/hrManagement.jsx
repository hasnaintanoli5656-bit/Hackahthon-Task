import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../components/Sidebar";

const HRManagement = () => {
  const [hrList, setHrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
  });

  const loadHR = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "hr"));

      const snapshot = await getDocs(q);

      setHrList(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })),
      );
    } catch (error) {
      console.error(error);
      toast.error("HR list load nahi hui");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHR();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error("Saari fields fill karein");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Pehle login karein");
      return;
    }

    try {
      // HR profile request; this does not create a Firebase Auth account.
      await addDoc(collection(db, "hrRequests"), {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        requestedBy: auth.currentUser.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast.success("HR request submit ho gayi");
      setForm({ fullName: "", email: "" });
    } catch (error) {
      console.error(error);
      toast.error("Request save nahi hui. Firestore rules check karein.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Kya aap is HR profile ko delete karna chahte hain?",
    );

    if (!confirmed) return;

    try {
      // Only removes the Firestore profile, not its Auth account.
      await deleteDoc(doc(db, "users", id));
      setHrList((previous) => previous.filter((hr) => hr.id !== id));
      toast.success("HR profile delete ho gayi");
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
            <div className="mb-8">
              <p className="text-sm text-blue-600">Admin / HR Management</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                HR Management
              </h1>
              <p className="mt-2 text-slate-500">
                HR requests submit karein aur existing HR profiles dekhein.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Add HR Request</h2>
                <p className="mb-6 mt-2 text-sm text-slate-500">
                  HR candidate ki details enter karein.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="hr@example.com"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Submit HR Request
                  </button>
                </form>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Existing HR Team</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      HR profiles stored in Firestore.
                    </p>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                    {hrList.length} HR
                  </span>
                </div>

                {loading ? (
                  <p className="py-8 text-center text-slate-500">
                    Loading HR list...
                  </p>
                ) : hrList.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
                    <p className="font-medium text-slate-700">
                      No HR profiles found
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      HR profiles will appear here when available.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-500">
                          <th className="px-3 py-3">Name</th>
                          <th className="px-3 py-3">Email</th>
                          <th className="px-3 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hrList.map((hr) => (
                          <tr key={hr.id} className="border-b last:border-0">
                            <td className="px-3 py-4 font-medium">
                              {hr.fullName || hr.name || "—"}
                            </td>
                            <td className="px-3 py-4">{hr.email || "—"}</td>
                            <td className="px-3 py-4">
                              <button
                                onClick={() => handleDelete(hr.id)}
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

export default HRManagement;
