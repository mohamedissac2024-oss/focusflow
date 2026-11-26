import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/authService";
import { passwordRules, isStrong } from "../utils/passwordRules";

export default function ForgotPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get("email") || "");
  const [step, setStep] = useState(params.get("email") ? 2 : 1);
  const [otp, setOtp] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await forgotPassword(email);
      setInfo("If that email is registered, a 6-digit code has been sent.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSubmitting(false); }
  };

  const reset = async (e) => {
    e.preventDefault();
    setError("");
    if (!isStrong(next)) return setError("New password does not meet the rules below.");
    if (next !== confirm) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      await resetPassword({ email, otp, new_password: next, confirm_password: confirm });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally { setSubmitting(false); }
  };

  const input = "p-3 rounded bg-[#0B0B12] text-white border border-[#2A2A3D]";
  return (
    <div className="p-6 bg-[#0B0B12] min-h-screen flex items-center justify-center">
      <div className="bg-[#1A1A2E] border border-[#2A2A3D] p-8 rounded-xl w-[90%] max-w-md">
        <h1 className="text-white text-2xl font-bold text-center mb-6">Reset password</h1>
        {error && <p role="alert" className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        {info && <p className="mb-4 rounded bg-green-500/10 p-3 text-sm text-green-400">{info}</p>}

        {step === 1 ? (
          <form onSubmit={sendCode} className="flex flex-col gap-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={input} />
            <button disabled={submitting} className="bg-[#22D3EE] text-black font-bold p-3 rounded disabled:opacity-60">
              {submitting ? "Sending..." : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={reset} className="flex flex-col gap-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={input} />
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" inputMode="numeric" maxLength={6} className={input} />
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password" className={input} />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className={input} />
            <ul className="flex flex-col gap-1 text-sm">
              {passwordRules.map((r) => (
                <li key={r.label} className={r.test(next) ? "text-green-400" : "text-[#9CA3AF]"}>
                  {r.test(next) ? "✓" : "○"} {r.label}
                </li>
              ))}
            </ul>
            <button disabled={submitting} className="bg-[#22D3EE] text-black font-bold p-3 rounded disabled:opacity-60">
              {submitting ? "Resetting..." : "Reset password"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="text-sm text-[#9CA3AF]">Send a new code</button>
          </form>
        )}
        <p className="text-white text-center mt-4"><Link to="/login" className="text-[#22D3EE]">Back to login</Link></p>
      </div>
    </div>
  );
}