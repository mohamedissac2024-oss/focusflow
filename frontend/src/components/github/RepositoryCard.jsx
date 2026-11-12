import React from "react";
import { formatDate } from "../../utils/formatDate";

const RepositoryCard = ({ repo }) => {
  if (!repo) return null;

  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-400 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {repo.name}
          </a>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            {repo.private ? "Private" : "Public"}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {repo.description || "No repository description provided."}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          {repo.language && (
            <span className="font-medium text-slate-700 dark:text-slate-300">
              ● {repo.language}
            </span>
          )}
          <span>★ {repo.stargazers_count ?? 0}</span>
          <span>⑂ {repo.forks_count ?? 0}</span>
        </div>
        <span>
          Updated {repo.updated_at ? formatDate(repo.updated_at) : "recently"}
        </span>
      </div>
    </div>
  );
};

export default RepositoryCard;
