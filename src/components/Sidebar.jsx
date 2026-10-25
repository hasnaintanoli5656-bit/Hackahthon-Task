
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/admin-dashboard" },
  { label: "HR Management", path: "/hr-management" },
  { label: "Employees", path: "/employee-management" },
  { label: "Attendance", path: "/attendance" },
  { label: "Leave Requests", path: "/leave-management" },
  { label: "Payroll", path: "/payroll" },
];

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 shrink-0 bg-slate-900 p-5 text-white">
      <h2 className="text-xl font-bold">HCM Lite</h2>
      <p className="mt-1 text-sm text-slate-400">
        Human Capital Management
      </p>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
