import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const passwordRules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  { label: "One special character (! @ # $ %)", test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const isStrong = passwordRules.every((rule) => rule.test(password));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!isStrong) {
      setError("Please choose a stronger password that meets all the rules below.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Could not create the account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-[#0B0B12] min-h-screen flex items-center justify-center">
      <div className="bg-[#070A09]/65 border-white/30 text-zinc-100 placeholder:text-zinc-400 border border-white/15 p-8 rounded-xl w-[90%] max-w-md">
        <h1 className="text-white text-2xl font-bold text-center">FocusFlow</h1>
        <p className="text-[#9CA3AF] text-center mb-6">Create your account</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {error && <p role="alert" className="rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
            className="p-3 rounded bg-[#0B0B12] text-white border border-white/15" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
            className="p-3 rounded bg-[#0B0B12] text-white border border-white/15" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="p-3 rounded bg-[#0B0B12] text-white border border-white/15" />

          <ul className="flex flex-col gap-1 text-sm">
            {passwordRules.map((rule) => {
              const passed = rule.test(password);
              return (
                <li key={rule.label} className={passed ? "text-green-400" : "text-[#9CA3AF]"}>
                  {passed ? "✓" : "○"} {rule.label}
                </li>
              );
            })}
          </ul>

          <button disabled={submitting || !isStrong}
            className="bg-[#22D3EE] text-black font-bold p-3 rounded disabled:opacity-60">
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-white text-center mt-4">
          Already have an account? <Link to="/login" className="text-[#22D3EE]">Login</Link>
        </p>
      </div>
    </div>
  );
}