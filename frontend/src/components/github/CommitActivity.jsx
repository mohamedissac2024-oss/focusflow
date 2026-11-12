import React from "react";
import { formatDate } from "../../utils/formatDate";

const CommitActivity = ({ commits = [] }) => {
  if (!commits.length) {
    return (
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-sm text-slate-500 dark:text-slate-400">
        No recent commit activity found.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Recent Commit Activity
      </h3>

      <ul className="space-y-4">
        {commits.map((item, idx) => {
          const sha = item.sha ? item.sha.slice(0, 7) : `commit-${idx}`;
          const message =
            item.commit?.message || item.message || "Updated codebase";
          const author =
            item.commit?.author?.name || item.author || "Developer";
          const date = item.commit?.author?.date || item.date;
          const repoName = item.repo_name || "";

          return (
            <li
              key={item.sha || idx}
              className="flex items-start justify-between gap-4 pb-3 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {message}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {author} {repoName && `in ${repoName}`} •{" "}
                  {date ? formatDate(date) : "Just now"}
                </p>
              </div>

              <span className="font-mono text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                {sha}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CommitActivity;
