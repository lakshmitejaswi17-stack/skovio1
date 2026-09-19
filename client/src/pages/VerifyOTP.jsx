import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(300);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((current) => current - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    setError("");

    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    const updatedOtp = [...otp];
    updatedOtp[index] = digit;

    setOtp(updatedOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const updatedOtp = ["", "", "", "", "", ""];

    pasted.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    const focusIndex = Math.min(pasted.length, 5);
    setTimeout(() => {
      inputRefs.current[focusIndex]?.focus();
    }, 50);
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("Email information is missing. Please register again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/verify-otp", {
        email,
        otp: otpValue,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending || !email) return;

    try {
      setResending(true);
      setError("");

      await api.post("/auth/resend-otp", {
        email,
      });

      setOtp(["", "", "", "", "", ""]);
      setTimer(300);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to resend the verification code."
      );
    } finally {
      setResending(false);
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f8fc] text-slate-900">
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-200/60 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -35, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl"
      />

      <header className="relative z-10 w-full">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <Link to="/login" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg"
            >
              S
            </motion.div>
            <span className="text-lg font-bold tracking-tight">SecureAuth</span>
          </Link>

          <Link
            to="/login"
            className="text-sm font-semibold text-slate-500 transition hover:text-violet-600"
          >
            Back to sign in
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="mx-auto w-full max-w-md"
        >
          <div className="w-full rounded-4xl border border-white bg-white/95 p-6 text-center shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-10">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "backOut" }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.1,
                      duration: 0.5,
                      type: "spring",
                    }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-500"
                  >
                    ✓
                  </motion.div>

                  <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-950">
                    Email verified!
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Your account has been successfully verified.
                    <br />
                    Taking you to sign in...
                  </p>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.7, ease: "linear" }}
                    className="mx-auto mt-7 h-1 max-w-xs rounded-full bg-emerald-400"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 2, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50 text-3xl"
                  >
                    ✉️
                  </motion.div>

                  <div className="mt-7">
                    <div className="mb-4 inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
                      Email verification
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                      Check your inbox
                    </h1>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                      We've sent a 6-digit verification code to
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {email || "your email address"}
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleVerify} className="mt-7 w-full">
                    <div
                      className="grid w-full grid-cols-6 gap-1.5 sm:gap-2.5"
                      onPaste={handlePaste}
                    >
                      {otp.map((digit, index) => (
                        <motion.input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 }}
                          type="text"
                          inputMode="numeric"
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleChange(index, e.target.value)
                          }
                          onKeyDown={(event) => handleKeyDown(index, event)}
                          className="aspect-square max-h-16 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-bold text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-300 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 sm:rounded-2xl sm:text-xl"
                        />
                      ))}
                    </div>

                    <div className="mt-6 text-sm">
                      {timer > 0 ? (
                        <p className="text-slate-400">
                          Code expires in{" "}
                          <span className="font-semibold text-violet-600">
                            {String(minutes).padStart(2, "0")}:
                            {String(seconds).padStart(2, "0")}
                          </span>
                        </p>
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-medium text-red-500"
                        >
                          Your code has expired.
                        </motion.p>
                      )}
                    </div>

                    <motion.button
                      whileHover={{
                        scale: 1.01,
                        boxShadow: "0 12px 30px rgba(124,58,237,0.18)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      type="submit"
                      className="mt-7 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Verifying...
                        </span>
                      ) : (
                        "Verify email →"
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-7 text-sm text-slate-500">
                    Didn't receive the code?{" "}
                    {timer > 0 ? (
                      <span className="font-semibold text-slate-400">
                        Resend in {timer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="font-semibold text-violet-600 transition hover:text-violet-700 disabled:opacity-50"
                      >
                        {resending ? "Sending..." : "Resend code"}
                      </button>
                    )}
                  </div>

                  <Link
                    to="/register"
                    className="mt-5 inline-block text-xs font-medium text-slate-400 transition hover:text-slate-700"
                  >
                    ← Use a different email
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default VerifyOTP;