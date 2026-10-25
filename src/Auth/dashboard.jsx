

import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config.js";
import { toast , ToastContainer } from "react-toastify";

function Dashboard() {
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await signOut(auth);

      navigate("/login");
    } catch (error) {
      toast.error("Logout Failed!");
      console.log(error);
    }
  };

  const user = auth.currentUser;
  console.log(user)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">My Dashboard</h1>

        <button
          onClick={logoutHandler}
          className="rounded-lg bg-red-500 px-5 py-2 font-medium text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      {/* Dashboard Content */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <h2 className="mb-3 text-3xl font-bold text-gray-800">
            Welcome Back!
          </h2>

          <p className="mb-6 text-gray-500">
            You have successfully logged in to your account.
          </p>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              User Information
            </h3>

            <p className="mb-2 text-gray-600">
              <span className="font-medium text-gray-800">Email:</span>{" "}
              {user?.email || "No email available"}
            </p>

            <p className="break-all text-gray-600">
              <span className="font-medium text-gray-800">User ID:</span>{" "}
              {user?.uid || "No user ID available"}
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Dashboard;
