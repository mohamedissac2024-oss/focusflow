import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import AuthBackground from "./AuthBackground";
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
    <AuthBackground>
      <form
        onSubmit={handleLogin}
        className="bg-[#070A09]/55 backdrop-blur-sm shadow-2xl backdrop-blur-xs border border-white/15 p-8 rounded-xl w-full shadow-2xl"
      >
        <div className="flex items-center mb-3">
          <img
            src="/Focus%20flow.jpg.jpeg?v=3"
            alt="FocusFlow"
            className="h-20 w-auto rounded-xl object-contain mix-blend-lighten"
          />
        </div>

        <p className="text-[#9CA3AF] mb-6">Welcome back.</p>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between mt-3">
          <Link
            to="/forgot-password"
            className="text-[#22D3EE] text-sm font-semibold hover:text-white hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </Button>
        </div>

        <p className="text-[#9CA3AF] text-sm mt-5">
          No account?{" "}
          <Link to="/register" className="text-[#22D3EE] hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthBackground>
  );
}
