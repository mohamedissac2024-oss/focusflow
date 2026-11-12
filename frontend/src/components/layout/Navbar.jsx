import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const Navbar = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 flex items-center justify-between">
      {/* Mobile Menu Trigger & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          ☰
        </button>
        <span className="md:hidden text-lg font-bold text-blue-600 dark:text-blue-400">
          FocusFlow
        </span>
      </div>

      {/* Right Controls: Theme Toggle & User Profile */}
      <div className="flex items-center gap-4 ml-auto">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">
            {user?.name || user?.email || "Developer"}
          </span>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
