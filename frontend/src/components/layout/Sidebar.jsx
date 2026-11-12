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

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
          FocusFlow
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
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
    </aside>
  );
};

export default Sidebar;
