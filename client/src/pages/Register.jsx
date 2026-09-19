import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "").slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        phone: numbersOnly,
      }));

      setError("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const getPasswordStrength = () => {
    const password = formData.password;

    if (!password) {
      return {
        label: "",
        width: "0%",
        level: 0,
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak password",
        width: "35%",
        level: 1,
      };
    }

    if (score <= 3) {
      return {
        label: "Good password",
        width: "65%",
        level: 2,
      };
    }

    return {
      label: "Strong password",
      width: "100%",
      level: 3,
    };
  };

  const passwordStrength = getPasswordStrength();

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (formData.phone.length !== 10) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", formData);

      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      <motion.div
        animate={{
          x: [0, 45, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-200/60 blur-3xl sm:h-96 sm:w-96"
      />

      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl sm:-bottom-40 sm:h-112 sm:w-md"
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
          Already a member?{" "}
          <Link
            to="/login"
            className="font-semibold text-slate-950 transition hover:text-violet-600"
          >
            Sign in
          </Link>
        </p>
      </motion.header>

      <main className="relative flex min-h-[calc(100vh-90px)] w-full items-center justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="w-full min-w-0 max-w-lg"
        >
          <div className="w-full rounded-4xl border border-white bg-white/90 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-9">
            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Create your account
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Let's get you started.
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your details below. We'll send a verification code to
                your email.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone number
                </label>

                <div className="flex min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition duration-200 focus-within:border-violet-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/10">
                  <div className="flex shrink-0 items-center gap-2 border-r border-slate-200 px-3 sm:px-4">
                    <span className="text-base">🇮🇳</span>
                    <span className="text-sm font-semibold text-slate-500">
                      +91
                    </span>
                  </div>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    required
                    className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />

                  <AnimatePresence>
                    {formData.phone.length === 10 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center pr-4 text-emerald-500"
                      >
                        ✓
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  {formData.phone.length}/10 digits
                </p>
              </div>

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
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-16 text-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 transition hover:text-violet-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3"
                    >
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: passwordStrength.width }}
                          transition={{ duration: 0.4 }}
                          className={`h-full rounded-full ${
                            passwordStrength.level === 1
                              ? "bg-red-400"
                              : passwordStrength.level === 2
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                          }`}
                        />
                      </div>

                      <p
                        className={`mt-1.5 text-xs font-medium ${
                          passwordStrength.level === 1
                            ? "text-red-500"
                            : passwordStrength.level === 2
                              ? "text-amber-500"
                              : "text-emerald-500"
                        }`}
                      >
                        {passwordStrength.label}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-16 text-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 transition hover:text-violet-600"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <AnimatePresence>
                  {formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 text-xs font-medium ${
                        passwordsMatch ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {passwordsMatch
                        ? "✓ Passwords match"
                        : "Passwords do not match"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 12px 30px rgba(124,58,237,0.18)",
                }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="mt-2 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </span>
                ) : (
                  "Create account →"
                )}
              </motion.button>
            </form>

            <div className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-950 transition hover:text-violet-600"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Register;