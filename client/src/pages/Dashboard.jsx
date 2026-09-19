import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadUser = async () => {
      try {
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const firstLetter = user.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-200/60 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl sm:-bottom-40 sm:-right-40 sm:h-112 sm:w-md"
      />

      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-white/70 bg-white/60 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg"
            >
              S
            </motion.div>
            <span className="text-lg font-bold tracking-tight">SecureAuth</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:text-red-500"
          >
            Log out
          </motion.button>
        </div>
      </motion.header>

      <main className="relative z-10 mx-auto w-full max-w-6xl min-w-0 px-4 py-10 sm:px-8 sm:py-14">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet-600 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Account active
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Welcome back, {user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Here's your account information.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="overflow-hidden rounded-4xl border border-white bg-white/90 shadow-[0_30px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl"
        >
          <div className="relative overflow-hidden bg-slate-950 px-5 py-8 text-white sm:px-10">
            <motion.div
              animate={{ x: [0, 25, 0], y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-3xl font-bold text-violet-600 shadow-xl"
              >
                {firstLetter}
              </motion.div>
              <div>
                <p className="text-sm text-slate-400">Verified account</p>
                <h2 className="mt-1 text-2xl font-bold">{user.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            <DetailCard icon="👤" label="Full name" value={user.name} delay={0.35} />
            <DetailCard icon="📱" label="Phone number" value={`+91 ${user.phone}`} delay={0.45} />
            <DetailCard icon="✉️" label="Email address" value={user.email} delay={0.55} breakValue />
          </div>

          <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">✓</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Email verified</p>
                  <p className="text-xs text-slate-400">Your account is ready to use.</p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">Verified</span>
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-slate-400"
        >
          SecureAuth · Your information is protected
        </motion.div>
      </main>
    </div>
  );
}

function DetailCard({ icon, label, value, delay, breakValue = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">{icon}</div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1 font-semibold text-slate-800 ${breakValue ? "break-all" : "wrap-break-word"}`}>
        {value}
      </p>
    </motion.div>
  );
}

export default Dashboard;