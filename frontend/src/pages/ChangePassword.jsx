import { useState } from "react";
import AppHeader from "../components/layout/AppHeader";
import { changePassword } from "../services/authService";
import { passwordRules, isStrong } from "../utils/passwordRules";

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!isStrong(next)) return setError("New password does not meet the rules below.");
    if (next !== confirm) return setError("New passwords do not match.");
    setSubmitting(true);
    try {
      await changePassword({ current_password: current, new_password: next, confirm_password: confirm });
      setSuccess("Password updated.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const input = "p-3 rounded bg-[#0B0B12] text-white border border-[#2A2A3D]";
  return (
    <>
      <AppHeader />
      <div className="p-6 bg-[#0B0B12] min-h-screen flex items-start justify-center">
        <div className="bg-[#1A1A2E] border border-[#2A2A3D] p-8 rounded-xl w-[90%] max-w-md">
          <h1 className="text-white text-2xl font-bold text-center mb-6">Change password</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p role="alert" className="rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
            {success && <p className="rounded bg-green-500/10 p-3 text-sm text-green-400">{success}</p>}
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" className={input} />
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
              {submitting ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}