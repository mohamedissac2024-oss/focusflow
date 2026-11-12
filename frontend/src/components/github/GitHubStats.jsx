import React from "react";

const GitHubStats = ({ stats = {} }) => {
  const {
    publicRepos = 0,
    totalStars = 0,
    recentCommits = 0,
    followers = 0,
  } = stats;

  const metrics = [
    { label: "Public Repositories", value: publicRepos },
    { label: "Total Stars Earned", value: totalStars },
    { label: "Recent Commits", value: recentCommits },
    { label: "Followers", value: followers },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {metric.label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default GitHubStats;
