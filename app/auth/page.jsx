"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/lib/slices/authSlice";
import { initSocket } from "@/lib/socket";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, GraduationCap, Users, MessageSquare, Calendar, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ── Animated field ──────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, autoFocus }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-[0.06em]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="input text-[15px] h-11"
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, showPw, setShowPw, placeholder = "Password", autoFocus }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-semibold text-[var(--text-2)] uppercase tracking-[0.06em]">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPw ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="input text-[15px] h-11 pr-11"
        />
        <button
          type="button"
          onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ label, onClick, loading, disabled }) {
  return (
    <button
      type="button"
      disabled={loading || disabled}
      onClick={onClick}
      className="btn-primary w-full h-11 text-[15px] gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

// ── Left panel features ─────────────────────────────────────────────────────
const panelFeatures = [
  { icon: Users, text: "Connect with 10,000+ alumni worldwide" },
  { icon: MessageSquare, text: "Real-time messaging with your network" },
  { icon: Calendar, text: "Discover alumni events in your city" },
  { icon: GraduationCap, text: "AI assistant for career advice" },
];

// ── Page animated variant ───────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, x: 12, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -12, filter: "blur(4px)" },
};
const pageTransition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] };

// ── Main ────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const otpRefs = useRef([]);

  // Handle initial step and redirections
  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.isVerified) {
        router.push("/feed");
      } else {
        // Logged in but not verified -> force verify step
        setStep("verify");
        setEmail(user.email);
      }
    }
  }, [isLoggedIn, user, router]);

  const handleOtpChange = (i, val) => {
    // Only allow digits
    const digit = val.slice(-1);
    if (digit && !/^\d$/.test(digit)) return;

    const next = [...otp];
    next[i] = digit;
    setOtp(next);

    // If digit entered, move to next field
    if (digit && i < 5) {
      otpRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    // Check if it's 6 digits
    if (!/^\d{6}$/.test(data)) return;

    const digits = data.split("");
    setOtp(digits);
    // Focus the last input or the first empty one
    otpRefs.current[5]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const run = useCallback(async (fn) => {
    setLoading(true);
    try { await fn(); }
    catch (err) { toast.error(err.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      dispatch(setUser(data.data)); initSocket(data.data._id);
      toast.success("Welcome back!"); router.push("/feed");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";

      // If message contains "verify", they are registered but not verified
      if (msg.toLowerCase().includes("verify")) {
        toast.error("Account not verified. Redirecting to verification...");
        setStep("verify");
        handleResend();
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => run(async () => {
    await api.post("/auth/register", { firstName, lastName, email, password });
    toast.success("OTP sent to your email!"); setStep("verify");
  });

  const handleVerify = () => run(async () => {
    const { data } = await api.post("/auth/verify-otp", { email, otp: otp.join("") });
    dispatch(setUser(data.data)); initSocket(data.data._id);
    toast.success("Email verified — welcome!"); router.push("/feed");
  });

  const handleResend = () => run(async () => {
    await api.post("/auth/resend-otp", { email });
    toast.success("OTP resent!"); setOtp(["", "", "", "", "", ""]);
  });

  const handleForgot = () => run(async () => {
    await api.post("/auth/forgot-password", { email });
    toast.success("Reset OTP sent!"); setStep("reset");
  });

  const handleReset = () => run(async () => {
    await api.post("/auth/reset-password", { email, otp: otp.join(""), newPassword });
    toast.success("Password reset! Please log in."); setStep("login");
  });

  // ── OTP input component (shared) ─────────────────────────────────
  const OtpInputs = () => (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {otp.map((d, i) => (
        <input
          key={i}
          ref={(el) => (otpRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleOtpChange(i, e.target.value)}
          onKeyDown={(e) => handleOtpKey(i, e)}
          onPaste={handlePaste}
          className={`
            w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none
            transition-all duration-150 bg-[var(--surface-2)]
            ${d
              ? "border-[rgb(var(--primary-rgb))] bg-[var(--primary-alpha)] text-[rgb(var(--primary-rgb))]"
              : "border-[var(--border)] text-[var(--text-1)]"
            }
            focus:border-[rgb(var(--primary-rgb))] focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)]
          `}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>

      {/* ── Left brand panel (desktop only) ──────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[460px] xl:w-[520px] shrink-0 p-10 xl:p-14 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgb(49,46,129) 0%, rgb(79,70,229) 50%, rgb(109,40,217) 100%)"
        }}
      >
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E\")" }}
        />

        {/* Top logo */}
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-base">A</span>
            </div>
            <span className="font-extrabold text-white text-base tracking-[-0.04em]">GradLink</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4" style={{ letterSpacing: "-0.04em" }}>
              Your alumni network,<br />reimagined.
            </h2>
            <p className="text-indigo-200 text-[14px] leading-relaxed">
              Connect, collaborate, and grow with the people who shaped your journey.
            </p>
          </div>

          <div className="space-y-4">
            {panelFeatures.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-indigo-100 text-[13px]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-indigo-200 text-[12px] leading-relaxed italic">
            "GradLink helped me find my co-founder within a week of joining."
          </p>
          <p className="text-indigo-300 text-[11px] font-semibold mt-2">— Arjun S., Batch of 2019</p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Theme toggle */}
        <div className="absolute top-5 right-5 flex items-center gap-3">
          <ThemeToggle />
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white font-bold text-[13px] hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[rgb(var(--primary-rgb))] rounded-[10px] flex items-center justify-center shadow-[var(--shadow-primary)]">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <span className="font-extrabold text-[15px] tracking-[-0.04em] text-[var(--text-1)]">GradLink</span>
        </div>

        <div className="w-full max-w-[380px]">
          <AnimatePresence mode="wait">
            {/* ── LOGIN ──────────────────────────────────────── */}
            {step === "login" && (
              <motion.div key="login" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-[var(--text-1)] tracking-[-0.04em]">Welcome back</h1>
                  <p className="text-[13px] text-[var(--text-2)] mt-1">Sign in to your account</p>
                </div>
                <div className="space-y-4">
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    autoFocus
                  />
                  <PasswordField label="Password" value={password} onChange={setPassword} showPw={showPw} setShowPw={setShowPw} />
                  <div className="flex justify-end">
                    <button onClick={() => setStep("forgot")} className="text-[12px] font-semibold text-[rgb(var(--primary-rgb))] hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <SubmitButton label="Sign In" onClick={handleLogin} loading={loading} />
                </div>
                <p className="text-center text-[13px] text-[var(--text-2)]">
                  Don't have an account?{" "}
                  <button onClick={() => setStep("register")} className="font-semibold text-[rgb(var(--primary-rgb))] hover:underline">
                    Create one
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── REGISTER ───────────────────────────────────── */}
            {step === "register" && (
              <motion.div key="register" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-[var(--text-1)] tracking-[-0.04em]">Create account</h1>
                  <p className="text-[13px] text-[var(--text-2)] mt-1">Join the alumni network today</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Rahul" />
                    <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Mehta" />
                  </div>
                  <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                  <PasswordField label="Password" value={password} onChange={setPassword} showPw={showPw} setShowPw={setShowPw} placeholder="Min. 6 characters" />
                  <SubmitButton label="Create Account" onClick={handleRegister} loading={loading} />
                </div>
                <p className="text-center text-[13px] text-[var(--text-2)]">
                  Already have an account?{" "}
                  <button onClick={() => setStep("login")} className="font-semibold text-[rgb(var(--primary-rgb))] hover:underline">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── VERIFY OTP ─────────────────────────────────── */}
            {step === "verify" && (
              <motion.div key="verify" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="space-y-6">
                <button onClick={() => setStep("login")} className="flex items-center gap-1.5 text-[13px] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors -mb-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div>
                  <h1 className="text-2xl font-black text-[var(--text-1)] tracking-[-0.04em]">Check your email</h1>
                  <p className="text-[13px] text-[var(--text-2)] mt-1">
                    We sent a 6-digit code to <span className="font-semibold text-[var(--text-1)]">{email}</span>
                  </p>
                </div>
                <OtpInputs />
                <SubmitButton 
                  label="Verify Email" 
                  onClick={handleVerify} 
                  loading={loading} 
                  disabled={otp.some(d => !d)}
                />
                <p className="text-center text-[13px] text-[var(--text-2)]">
                  Didn't receive it?{" "}
                  <button onClick={handleResend} disabled={loading} className="font-semibold text-[rgb(var(--primary-rgb))] hover:underline disabled:opacity-50">
                    Resend OTP
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── FORGOT ─────────────────────────────────────── */}
            {step === "forgot" && (
              <motion.div key="forgot" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="space-y-6">
                <button onClick={() => setStep("login")} className="flex items-center gap-1.5 text-[13px] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors -mb-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div>
                  <h1 className="text-2xl font-black text-[var(--text-1)] tracking-[-0.04em]">Reset password</h1>
                  <p className="text-[13px] text-[var(--text-2)] mt-1">Enter your email to receive a reset code</p>
                </div>
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoFocus />
                <SubmitButton label="Send Reset Code" onClick={handleForgot} loading={loading} />
              </motion.div>
            )}

            {/* ── RESET ──────────────────────────────────────── */}
            {step === "reset" && (
              <motion.div key="reset" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="space-y-6">
                <button onClick={() => setStep("login")} className="flex items-center gap-1.5 text-[13px] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors -mb-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div>
                  <h1 className="text-2xl font-black text-[var(--text-1)] tracking-[-0.04em]">New password</h1>
                  <p className="text-[13px] text-[var(--text-2)] mt-1">Enter the code from your email</p>
                </div>
                <OtpInputs />
                <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} showPw={showPw} setShowPw={setShowPw} placeholder="Min. 6 characters" />
                <SubmitButton label="Reset Password" onClick={handleReset} loading={loading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
