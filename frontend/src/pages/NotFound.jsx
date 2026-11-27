import { Link } from "react-router-dom";
import AuthBackground from "./AuthBackground";

export default function NotFound() {
  return (
    <AuthBackground>
      <div className="bg-[#070A09]/55 backdrop-blur-sm shadow-2xl backdrop-blur-xs border border-white/15 p-8 rounded-xl w-full shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <img
            src="/Focus%20flow.jpg.jpeg"
            alt="FocusFlow"
            className="h-12 w-auto object-contain"
          />
        </div>

        <h1 className="text-white text-2xl font-bold tracking-tight mb-3">
          Welcome to FocusFlow
        </h1>

        <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6">
          Organize your projects, manage daily tasks, take structured notes, and
          track deep-focus sessions in one distraction-free workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </Link>
          <Link
            to="/register"
            className="border border-white/15 hover:border-[#D4F82E] text-zinc-200 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </AuthBackground>
  );
}
