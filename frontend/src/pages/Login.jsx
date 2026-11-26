import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-[#12121C] border border-[#2A2A3D] p-8 rounded-xl w-[90%] max-w-md">
        <h1 className="text-white text-2xl font-bold">FocusFlow</h1>
        <p className="text-[#9CA3AF] mb-6">Welcome back</p>
        {error && <p role="alert" className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
     <Link
  to="/forgot-password"
  className="text-[#22D3EE] text-sm font-semibold hover:text-white hover:underline transition-colors"
>
  Forgot Password?
</Link>
        <Button type="submit" disabled={submitting}>{submitting ? "Logging in..." : "Login"}</Button>
        <p className="text-[#9CA3AF] text-sm mt-4">
          No account? <Link to="/register" className="text-[#22D3EE] hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
