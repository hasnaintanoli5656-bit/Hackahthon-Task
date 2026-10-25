
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { toast, ToastContainer } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Redirect user according to Firestore role
  const redirectByRole = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        throw new Error(
          "User profile nahi mila. Please signup ya admin se contact karein."
        );
      }

      const role = userSnapshot.data().role;

      const routes = {
        admin: "/admin-dashboard",
        hr: "/hr-dashboard",
        employee: "/dashboard",
      };

      if (!routes[role]) {
        throw new Error(
          "User role invalid hai. Firestore mein role check karein."
        );
      }

      toast.success("Login successful!");
      navigate(routes[role], { replace: true });
    } catch (error) {
      console.error("Role redirect error:", error);

      // Do not keep users signed in when their profile or role is invalid
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Sign out error:", signOutError);
      }

      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      await redirectByRole(response.user);
    } catch (error) {
      console.error("Login error:", error);

      if (error.code === "auth/invalid-credential") {
        toast.error("Email ya password incorrect hai.");
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const response = await signInWithPopup(auth, provider);

      await redirectByRole(response.user);
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white">
            H
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to your HCM Lite account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Continue with Google"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
