"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/lib/slices/authSlice";
import { initSocket } from "@/lib/socket";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

// ── Sub-components (outside main render) ────────────────────────────────────

const InputRow = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} 
      className="input" 
    />
  </div>
);

const PasswordRow = ({ label, value, onChange, showPw, setShowPw, placeholder = "Password" }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
    <div className="relative">
      <input 
        type={showPw ? "text" : "password"} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} 
        className="input pr-10" 
      />
      <button 
        type="button" 
        onClick={() => setShowPw(!showPw)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      >
        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

const SubmitBtn = ({ label, onClick, loading }) => (
  <button 
    type="button" 
    disabled={loading} 
    onClick={onClick} 
    className="btn-primary w-full flex items-center justify-center gap-2"
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {label}
  </button>
);

// ── Main Page Component ──────────────────────────────────────────────────────

export default function AuthPage() {
  const dispatch = useDispatch();
  const router   = useRouter();

  const [step, setStep]       = useState("login");
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);

  // OTP fields
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  // Reset password
  const [newPassword, setNewPassword] = useState("");

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const run = useCallback(async (fn) => {
    setLoading(true);
    try { 
      await fn(); 
    } catch (err) { 
      toast.error(err.response?.data?.message || "Something went wrong"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  const handleLogin = () => run(async () => {
    const { data } = await api.post("/auth/login", { email, password });
    dispatch(setUser(data.data));
    initSocket(data.data._id);
    toast.success("Welcome back!");
    router.push("/feed");
  });

  const handleRegister = () => run(async () => {
    await api.post("/auth/register", { firstName, lastName, email, password });
    toast.success("OTP sent to your email!");
    setStep("verify");
  });

  const handleVerify = () => run(async () => {
    const { data } = await api.post("/auth/verify-otp", { email, otp: otp.join("") });
    dispatch(setUser(data.data));
    initSocket(data.data._id);
    toast.success("Email verified — welcome!");
    router.push("/feed");
  });

  const handleResend = () => run(async () => {
    await api.post("/auth/resend-otp", { email });
    toast.success("OTP resent!");
    setOtp(["", "", "", "", "", ""]);
  });

  const handleForgot = () => run(async () => {
    await api.post("/auth/forgot-password", { email });
    toast.success("Reset OTP sent!");
    setStep("reset");
  });

  const handleReset = () => run(async () => {
    await api.post("/auth/reset-password", { email, otp: otp.join(""), newPassword });
    toast.success("Password reset! Please log in.");
    setStep("login");
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-primary/10 dark:from-slate-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <span className="text-white font-black text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">AlumniConnect</h1>
          <p className="text-slate-500 text-sm mt-1">Stay connected with your alumni network</p>
        </div>

        <div className="card p-8 shadow-xl">
          {(step === "verify" || step === "forgot" || step === "reset") && (
            <button onClick={() => setStep("login")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-5">
              <ArrowLeft className="w-4 h-4" /> Back to login
            </button>
          )}

          {step === "login" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Welcome back</h2>
              <InputRow label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              <PasswordRow label="Password" value={password} onChange={setPassword} showPw={showPw} setShowPw={setShowPw} />
              <button onClick={() => setStep("forgot")} className="text-sm text-primary hover:underline">Forgot password?</button>
              <SubmitBtn label="Sign In" onClick={handleLogin} loading={loading} />
              <p className="text-center text-sm text-slate-500">
                No account?{" "}
                <button onClick={() => setStep("register")} className="text-primary font-semibold hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          )}

          {step === "register" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Create account</h2>
              <div className="grid grid-cols-2 gap-3">
                <InputRow label="First name" value={firstName} onChange={setFirstName} placeholder="John" />
                <InputRow label="Last name" value={lastName} onChange={setLastName} placeholder="Doe" />
              </div>
              <InputRow label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              <PasswordRow label="Password" value={password} onChange={setPassword} showPw={showPw} setShowPw={setShowPw} placeholder="Min. 6 characters" />
              <SubmitBtn label="Create Account" onClick={handleRegister} loading={loading} />
              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button onClick={() => setStep("login")} className="text-primary font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Verify your email</h2>
                <p className="text-sm text-slate-500 mt-1">
                  We sent a 6-digit code to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => (otpRefs.current[i] = el)}
                    type="text" maxLength={1} value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="w-11 h-14 text-center text-2xl font-bold input"
                  />
                ))}
              </div>
              <SubmitBtn label="Verify Email" onClick={handleVerify} loading={loading} />
              <p className="text-center text-sm text-slate-500">
                Didn&apos;t get it?{" "}
                <button onClick={handleResend} disabled={loading} className="text-primary font-semibold hover:underline">
                  Resend OTP
                </button>
              </p>
            </div>
          )}

          {step === "forgot" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Reset password</h2>
              <p className="text-sm text-slate-500">Enter your email and we&apos;ll send a reset code.</p>
              <InputRow label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              <SubmitBtn label="Send Reset Code" onClick={handleForgot} loading={loading} />
            </div>
          )}

          {step === "reset" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Enter new password</h2>
                <p className="text-sm text-slate-500 mt-1">Enter the OTP from your email and your new password.</p>
              </div>
              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => (otpRefs.current[i] = el)}
                    type="text" maxLength={1} value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKey(i, e)}
                    className="w-11 h-14 text-center text-2xl font-bold input"
                  />
                ))}
              </div>
              <PasswordRow label="New Password" value={newPassword} onChange={setNewPassword} showPw={showPw} setShowPw={setShowPw} placeholder="Min. 6 characters" />
              <SubmitBtn label="Reset Password" onClick={handleReset} loading={loading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
