import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Projects", path: "/projects" },
  { label: "Tasks", path: "/tasks" },
  { label: "Focus Timer", path: "/focus-timer" },
  { label: "Notes", path: "/notes" },
  { label: "GitHub Activity", path: "/github" },
  { label: "Analytics", path: "/analytics" },
];

const MobileNavigation = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Slide-out Drawer */}
      <div className="relative w-64 max-w-xs bg-white dark:bg-slate-900 h-full shadow-xl flex flex-col z-10">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            FocusFlow
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
