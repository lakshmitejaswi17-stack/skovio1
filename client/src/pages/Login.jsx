import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      const { token, user, requiresVerification } = response.data;

      if (requiresVerification) {
        navigate("/verify-otp", {
          state: {
            email: user.email,
            fromLogin: true,
          },
        });

        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-200/60 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl"
      />

      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8 sm:py-7"
      >
        <Link to="/" className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg"
          >
            S
          </motion.div>

          <span className="text-lg font-bold tracking-tight">SecureAuth</span>
        </Link>

        <p className="text-sm text-slate-500">
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-slate-950 transition-colors hover:text-violet-600"
          >
            Create account
          </Link>
        </p>
      </motion.header>

      <main className="relative flex min-h-[calc(100vh-90px)] w-full items-center justify-center px-4 pb-10 sm:px-6 sm:pb-12">
        <div className="grid w-full max-w-5xl min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/70 px-4 py-2 text-xs font-semibold text-violet-600 shadow-sm backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
              Secure access
            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight text-slate-950">
              Your account,
              <br />
              <span className="text-violet-600">securely connected.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-500">
              Sign in to access your account and continue where you left off.
              Your information stays protected throughout your journey.
            </p>

            <div className="relative mt-10 h-28">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-0 top-0 rounded-2xl border border-white bg-white/80 px-5 py-4 shadow-xl shadow-slate-900/5 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                    🔐
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Account security
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      Email verified
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-64 top-14 rounded-2xl border border-white bg-white/80 px-5 py-4 shadow-xl shadow-slate-900/5 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Authentication
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      Protected access
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="mx-auto w-full min-w-0 max-w-md"
          >
            <div className="w-full rounded-4xl border border-white bg-white/90 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-9">
              <div className="mb-6 lg:hidden">
                <div className="mb-4 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
                  ✦ Secure access
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to your account to continue.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <div className="mb-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Password
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 transition hover:text-violet-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                  />
                  Remember me
                </label>

                <motion.button
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 12px 30px rgba(124,58,237,0.18)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in →"
                  )}
                </motion.button>
              </form>

              <div className="mt-7 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-slate-950 transition hover:text-violet-600"
                >
                  Create one
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Login;