import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AppHeader from "../components/layout/AppHeader";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState({ daily: [], by_project: [] });
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const [sumRes, trendRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/trends', { params: { days } }),
        ]);
        if (!active) return;
        setSummary(sumRes.data);
        setTrends(trendRes.data || { daily: [], by_project: [] });
      } catch (err) {
        if (active) setError(err.message || 'Failed to load analytics.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAnalytics();
    return () => {
      active = false;
    };
  }, [days]);

  const totalFocusMins = summary?.focus_minutes_total ?? 0;
  const focusLabel = `${Math.floor(totalFocusMins / 60)}h ${String(totalFocusMins % 60).padStart(
    2,
    '0'
  )}m`;
  const completionPct =
    summary?.tasks_total > 0
      ? Math.round((summary.tasks_completed / summary.tasks_total) * 100)
      : 0;

  const dailyBars = trends.daily || [];
  const maxFocus = Math.max(...dailyBars.map((d) => d.focus_minutes || 0), 1);
  const maxTasks = Math.max(...dailyBars.map((d) => d.tasks_completed || 0), 1);

  return (
     <>
         <AppHeader />
    <div className="p-6 bg-[#0B0B12] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#9CA3AF] font-semibold">
            Live Productivity &amp; Sprint Telemetry
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-0.5">Analytics</h1>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-[#151521] border border-[#2A2A3D] rounded-lg px-3 py-1.5 text-xs text-white self-start sm:self-center"
        >
          <option value={7}>Last 7d</option>
          <option value={14}>Last 14d</option>
          <option value={30}>Last 30d</option>
        </select>
      </div>

      {error && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-lg text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 text-center text-xs text-[#9CA3AF]">Loading telemetry...</div>
      ) : (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">
                Tasks Completed:{' '}
                <span className="text-white font-bold text-base">
                  {summary?.tasks_completed ?? 0}
                </span>
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                of {summary?.tasks_total ?? 0} ({completionPct}%)
              </p>
            </div>

            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">
                Total Focus Time:{' '}
                <span className="text-white font-bold text-base">{focusLabel}</span>
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                {summary?.focus_minutes_today ?? 0}m today
              </p>
            </div>

            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">
                Story Points Delivered:{' '}
                <span className="text-white font-bold text-base">
                  {summary?.points_completed ?? 0}/{summary?.points_total ?? 0} pts
                </span>
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Across {summary?.projects_total ?? 0} projects
              </p>
            </div>

            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">
                Consistency Streak:{' '}
                <span className="text-white font-bold text-base">
                  {summary?.current_streak ?? 0} days
                </span>
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Longest: {summary?.longest_streak ?? 0}d
              </p>
            </div>
          </div>

          {/* 2 Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
            {/* Chart 1: Focus Minutes per Day */}
            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white">Focus Minutes per Day</h2>
              <p className="text-xs text-[#9CA3AF]">last {days} days</p>

              <div className="flex items-end gap-3 h-40 mt-4 pt-4 border-b border-[#232336] pb-2">
                {dailyBars.map((d) => {
                  const pct =
                    d.focus_minutes > 0
                      ? Math.max(10, Math.round((d.focus_minutes / maxFocus) * 100))
                      : 4;
                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <span className="text-[10px] text-[#9CA3AF] mb-1">
                        {d.focus_minutes > 0 ? `${d.focus_minutes}m` : '0m'}
                      </span>
                      <div
                        className={`w-full rounded-t transition-all ${
                          d.focus_minutes > 0 ? 'bg-cyan-400' : 'bg-[#232336]'
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-1.5">
                {dailyBars.map((d) => (
                  <p key={d.date} className="flex-1 text-center text-[11px] text-[#9CA3AF]">
                    {d.label}
                  </p>
                ))}
              </div>
            </div>

            {/* Chart 2: Tasks Completed per Day */}
            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white">Tasks Completed per Day</h2>
              <p className="text-xs text-[#9CA3AF]">last {days} days</p>

              <div className="flex items-end gap-3 h-40 mt-4 pt-4 border-b border-[#232336] pb-2">
                {dailyBars.map((d) => {
                  const pct =
                    d.tasks_completed > 0
                      ? Math.max(10, Math.round((d.tasks_completed / maxTasks) * 100))
                      : 4;
                  return (
                    <div
                      key={d.date}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <span className="text-[10px] text-[#9CA3AF] mb-1">
                        {d.tasks_completed}
                      </span>
                      <div
                        className={`w-full rounded-t transition-all ${
                          d.tasks_completed > 0 ? 'bg-emerald-500' : 'bg-[#232336]'
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-1.5">
                {dailyBars.map((d) => (
                  <p key={d.date} className="flex-1 text-center text-[11px] text-[#9CA3AF]">
                    {d.label}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Project & Division Breakdown Table */}
          <div className="mt-5 bg-[#151521] border border-[#2A2A3D] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">Project &amp; Division Breakdown</h2>
              <Link to="/projects" className="text-xs text-cyan-400 hover:underline">
                Open Projects →
              </Link>
            </div>

            {(trends.by_project || []).length === 0 ? (
              <p className="text-xs text-[#9CA3AF] py-3">
                No project activity recorded yet. Assign tasks to a project to populate this table.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-[#9CA3AF] border-b border-[#232336]">
                      <th className="py-2.5 pr-4">Project</th>
                      <th className="py-2.5 px-4">Tasks</th>
                      <th className="py-2.5 px-4">Focus</th>
                      <th className="py-2.5 pl-4 w-1/2">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232336]">
                    {trends.by_project.map((proj, i) => {
                      const barColor =
                        i % 3 === 0
                          ? 'bg-cyan-400'
                          : i % 3 === 1
                          ? 'bg-amber-400'
                          : 'bg-emerald-400';
                      return (
                        <tr key={String(proj.project_id)} className="hover:bg-[#1A1A28]">
                          <td className="py-3 pr-4 font-semibold text-white">
                            <span className="inline-block font-mono text-[11px] px-1.5 py-0.5 mr-2 rounded bg-[#232336] text-indigo-300">
                              {proj.project_key}
                            </span>
                            {proj.name}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#9CA3AF]">
                            {proj.tasks_done}/{proj.tasks_total}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#9CA3AF]">
                            {proj.focus_minutes}m
                          </td>
                          <td className="py-3 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-[#0B0B12] rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${barColor} transition-all`}
                                  style={{ width: `${proj.completion_rate}%` }}
                                />
                              </div>
                              <span className="font-mono text-white w-9 text-right">
                                {proj.completion_rate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    </>
  );
}
