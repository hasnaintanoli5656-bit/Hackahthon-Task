import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../components/Sidebar";

const PayrollManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    month: "",
    baseSalary: "",
    allowances: "",
    deductions: "",
  });

  const loadData = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "employee"));

      const employeeSnapshot = await getDocs(q);

      setEmployees(
        employeeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );

      const payrollSnapshot = await getDocs(collection(db, "payroll"));

      setPayroll(
        payrollSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      );
    } catch (error) {
      toast.error("Payroll data load nahi hua");
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const base = Number(form.baseSalary) || 0;
  const allowances = Number(form.allowances) || 0;
  const deductions = Number(form.deductions) || 0;
  const netSalary = base + allowances - deductions;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.employeeId || !form.month || form.baseSalary === "") {
      toast.error("Required fields complete karo");
      return;
    }

    if (
      !Number.isFinite(base) ||
      !Number.isFinite(allowances) ||
      !Number.isFinite(deductions) ||
      base < 0 ||
      allowances < 0 ||
      deductions < 0 ||
      netSalary < 0
    ) {
      toast.error("Salary amounts valid hone chahiye");
      return;
    }

    const employee = employees.find((item) => item.id === form.employeeId);

    if (!employee) {
      toast.error("Employee select karo");
      return;
    }

    const duplicate = payroll.some(
      (item) =>
        item.employeeId === form.employeeId && item.month === form.month,
    );

    if (duplicate) {
      toast.error("Is employee ki salary is month ke liye already added hai");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "payroll"), {
        employeeId: employee.id,
        employeeName: employee.fullName || employee.name || employee.email,
        employeeEmail: employee.email || "",
        month: form.month,
        baseSalary: base,
        allowances,
        deductions,
        netSalary,
        currency: "PKR",
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Payroll successfully save ho gaya!");

      setForm({
        employeeId: "",
        month: "",
        baseSalary: "",
        allowances: "",
        deductions: "",
      });

      await loadData();
    } catch (error) {
      toast.error("Payroll save nahi hua");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const money = (amount) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1 p-6">
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold text-slate-800">
              Payroll Management
            </h1>

            <p className="mt-2 text-slate-500">
              Manage employee salaries and monthly payroll.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Payroll Records</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {payroll.length}
                </h2>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Employees</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {employees.length}
                </h2>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Payroll</p>
                <h2 className="mt-2 text-2xl font-bold text-emerald-600">
                  {money(
                    payroll.reduce(
                      (total, item) => total + (Number(item.netSalary) || 0),
                      0,
                    ),
                  )}
                </h2>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="mb-6 text-xl font-bold text-slate-800">
                Generate Salary
              </h2>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Select Employee *
                  </label>
                  <select
                    required
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm({ ...form, employeeId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                  >
                    <option value="">Choose employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName || employee.name || employee.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Salary Month *
                  </label>
                  <input
                    required
                    type="month"
                    value={form.month}
                    onChange={(e) =>
                      setForm({ ...form, month: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Basic Salary (PKR) *
                  </label>
                  <input
                    required
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.baseSalary}
                    onChange={(e) =>
                      setForm({ ...form, baseSalary: e.target.value })
                    }
                    placeholder="50000"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Allowances (PKR)
                  </label>
                  <input
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.allowances}
                    onChange={(e) =>
                      setForm({ ...form, allowances: e.target.value })
                    }
                    placeholder="5000"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Deductions (PKR)
                  </label>
                  <input
                    min="0"
                    step="0.01"
                    type="number"
                    value={form.deductions}
                    onChange={(e) =>
                      setForm({ ...form, deductions: e.target.value })
                    }
                    placeholder="2000"
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-slate-500">Net Salary</p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {money(netSalary)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Basic + Allowances − Deductions
                  </p>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Generate Payroll"}
              </button>
            </form>

            <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b p-6">
                <h2 className="text-xl font-bold text-slate-800">
                  Payroll History
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Month</th>
                      <th className="p-4">Basic Salary</th>
                      <th className="p-4">Allowances</th>
                      <th className="p-4">Deductions</th>
                      <th className="p-4">Net Salary</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payroll.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="p-4 font-medium text-slate-800">
                          {item.employeeName}
                          <p className="text-xs text-slate-500">
                            {item.employeeEmail}
                          </p>
                        </td>
                        <td className="p-4">{item.month}</td>
                        <td className="p-4">{money(item.baseSalary)}</td>
                        <td className="p-4">{money(item.allowances)}</td>
                        <td className="p-4">{money(item.deductions)}</td>
                        <td className="p-4 font-semibold text-emerald-700">
                          {money(item.netSalary)}
                        </td>
                      </tr>
                    ))}

                    {payroll.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-slate-500"
                        >
                          Abhi koi payroll record nahi hai.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <ToastContainer />
        </div>
      </main>
    </div>
  );
};

export default PayrollManagement;
