import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import projectService from '../services/projectService';
import AppHeader from "../components/layout/AppHeader";

const getTodayISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split('T')[0];
};

const FILTER_TO_TAB = {
  today: 'today',
  overdue: 'overdue',
  upcoming: 'upcoming',
  completed: 'completed',
};

const PRIORITY_PILL = {
  high: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  low: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Task Bar state
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [projectId, setProjectId] = useState('');
  const [division, setDivision] = useState('General');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    FILTER_TO_TAB[searchParams.get('filter')] || 'today'
  ); // 'today' | 'overdue' | 'upcoming' | 'completed'
  const titleInputRef = useRef(null);

  const todayStr = useMemo(() => getTodayISO(), []);

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(projectId)) || null,
    [projects, projectId]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        projectService.getProjects().catch(() => []),
      ]);
      const taskList = Array.isArray(tasksRes.data)
        ? tasksRes.data
        : tasksRes.data?.tasks || [];
      const projList = Array.isArray(projectsRes)
        ? projectsRes
        : projectsRes?.projects || [];
      setTasks(taskList);
      setProjects(projList);
      if (projList.length > 0 && !projectId) {
        setProjectId(String(projList[0].id));
        setDivision(projList[0].divisions?.[0] || 'General');
      }
    } catch (err) {
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // React to the address bar: ?filter=overdue opens that tab, ?new=true focuses the Task Bar
  useEffect(() => {
    const tab = FILTER_TO_TAB[searchParams.get('filter')];
    if (tab) setActiveTab(tab);
    if (searchParams.get('new') === 'true') {
      titleInputRef.current?.focus();
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchParams]);

  const handleProjectChange = (nextId) => {
    setProjectId(nextId);
    const found = projects.find((p) => String(p.id) === String(nextId));
    setDivision(found?.divisions?.[0] || 'General');
  };

  const { overdueTasks, dueTodayTasks, completedTodayTasks, upcomingTasks, allCompleted } =
    useMemo(() => {
      const overdue = [];
      const today = [];
      const doneToday = [];
      const upcoming = [];
      const doneAll = [];

      tasks.forEach((t) => {
        if (t.status === 'done') {
          doneAll.push(t);
          const cDate = t.completed_at ? t.completed_at.slice(0, 10) : t.due_date;
          if (cDate === todayStr || t.due_date === todayStr) {
            doneToday.push(t);
          }
          return;
        }
        if (!t.due_date || t.due_date === todayStr) {
          today.push(t);
        } else if (t.due_date < todayStr) {
          overdue.push(t);
        } else {
          upcoming.push(t);
        }
      });

      return {
        overdueTasks: overdue,
        dueTodayTasks: today,
        completedTodayTasks: doneToday,
        upcomingTasks: upcoming,
        allCompleted: doneAll,
      };
    }, [tasks, todayStr]);

  const totalScope = overdueTasks.length + dueTodayTasks.length + completedTodayTasks.length;
  const dailyPct = totalScope > 0 ? Math.round((completedTodayTasks.length / totalScope) * 100) : 0;

  // SVG Donut Ring math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dailyPct / 100) * circumference;

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setError('');
      await api.post('/tasks', {
        title: title.trim(),
        priority,
        due_date: dueDate || todayStr,
        project_id: projectId ? Number(projectId) : null,
        division: projectId ? division : 'General',
        status: 'todo',
      });
      setTitle('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not add task.');
    }
  };

  const handleToggleDone = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await api.patch(`/tasks/${task.id}`, { status: nextStatus });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    }
  };

  const handleMoveToToday = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}`, { due_date: todayStr });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to reschedule task.');
    }
  };

  const handleLogFocus = async (task) => {
    try {
      await api.post('/analytics/log-focus', { task_id: task.id, duration_min: 25 });
      setNotice(`Logged +25m focus on "${task.title}" (synced to Projects & Analytics)`);
    } catch (err) {
      setError(err.message || 'Failed to log focus time.');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
    }
  };

  const handleRemindNow = async () => {
    const pending = overdueTasks.length + dueTodayTasks.length;
    const msg =
      pending === 0
        ? 'All tasks for today are completed!'
        : `Reminder: ${dueTodayTasks.length} due today and ${overdueTasks.length} overdue.`;
    setNotice(msg);
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('FocusFlow Daily Reminder', { body: msg });
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') new Notification('FocusFlow Daily Reminder', { body: msg });
      }
    }
  };

  const renderTaskCard = (task, mode = 'today') => {
    const keyPrefix = (task.issue_key || 'FF').split('-')[0];
    return (
      <div
        key={task.id}
        className="bg-[#151521] border border-[#2A2A3D] hover:border-[#3D3D58] rounded-xl p-3.5 transition"
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-semibold leading-snug ${
              task.status === 'done' ? 'line-through text-[#9CA3AF]' : 'text-white'
            }`}
          >
            {task.issue_key ? `${task.issue_key}: ` : ''}
            {task.title}
          </p>
          <button
            onClick={() => handleDelete(task.id)}
            className="text-xs text-[#6B7280] hover:text-rose-400 shrink-0"
            title="Delete"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px]">
          {task.project_id && (
            <Link
              to={`/projects?projectId=${task.project_id}`}
              className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold hover:bg-indigo-500/30"
            >
              {keyPrefix}
            </Link>
          )}
          {task.division && (
            <span className="px-2 py-0.5 rounded bg-[#1F2433] text-sky-300">
              {task.division}
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded border capitalize ${
              PRIORITY_PILL[task.priority] || PRIORITY_PILL.medium
            }`}
          >
            {task.priority}
          </span>
          <span className="text-[#9CA3AF] ml-auto">
            {mode === 'overdue'
              ? `Due ${task.due_date}`
              : mode === 'done'
              ? 'Completed Today'
              : task.due_date === todayStr
              ? 'Due Today'
              : task.due_date || 'Today'}
          </span>
        </div>

        <div className="mt-3 pt-2 border-t border-[#232336] flex items-center justify-between text-xs">
          <button
            onClick={() => handleToggleDone(task)}
            className={`font-medium ${
              task.status === 'done'
                ? 'text-[#9CA3AF] hover:text-white'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            {task.status === 'done' ? '↺ Reopen' : '✓ Complete'}
          </button>

          {mode === 'overdue' && (
            <button
              onClick={() => handleMoveToToday(task.id)}
              className="text-emerald-400 hover:underline font-medium"
            >
              Move to Today
            </button>
          )}

          {mode === 'today' && (
            <button
              onClick={() => handleLogFocus(task)}
              className="text-cyan-400 hover:underline font-medium"
            >
              ✓ Log Focus (+25m)
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
     <AppHeader />
    <div className="p-6 bg-[#0B0B12] min-h-screen text-white">
      {/* Top Header + Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#2A2A3D]">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#9CA3AF] font-semibold">
            Daily Reminder &amp; Focus Checklist
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-0.5">Today’s Tasks</h1>
        </div>

        <div className="flex flex-col sm:items-end gap-2.5">
          <button
            onClick={handleRemindNow}
            className="bg-[#151521] hover:bg-[#1E1E2E] border border-[#2A2A3D] text-amber-300 text-xs font-semibold px-3.5 py-2 rounded-lg transition self-start sm:self-end"
          >
            🔔 Remind Me Now
          </button>

          <div className="flex items-center gap-4 text-xs font-semibold">
            {[
              { id: 'today', label: "Today's Focus" },
              { id: 'overdue', label: 'Overdue' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setSearchParams(t.id === 'today' ? {} : { filter: t.id }, { replace: true });
                }}
                className={`pb-1.5 border-b-2 transition ${
                  activeTab === t.id
                    ? 'border-cyan-400 text-white'
                    : 'border-transparent text-[#9CA3AF] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {notice && (
        <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 px-4 py-2.5 rounded-lg text-xs flex justify-between items-center">
          <span>🔔 {notice}</span>
          <button onClick={() => setNotice('')} className="text-cyan-400">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* 4 KPI Summary Strip with SVG Progress Ring */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF]">Daily Progress:</p>
            <p className="text-2xl font-bold mt-1">{dailyPct}%</p>
          </div>
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="#232336"
              strokeWidth="4"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="#EAB308"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
          <p className="text-xs text-[#9CA3AF]">Due Today:</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{dueTodayTasks.length}</p>
        </div>

        <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
          <p className="text-xs text-[#9CA3AF]">Overdue:</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{overdueTasks.length}</p>
        </div>

        <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
          <p className="text-xs text-[#9CA3AF]">Done Today:</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {completedTodayTasks.length}
          </p>
        </div>
      </div>

      {/* Task Bar */}
      <form
        onSubmit={handleAddTask}
        className="mt-5 bg-[#151521] border border-[#2A2A3D] rounded-xl p-4"
      >
        <p className="text-xs font-bold text-white mb-3">Task Bar</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4">
            <label className="block text-[11px] text-[#9CA3AF] mb-1">Title</label>
            <input
              type="text"
              value={title}
              ref={titleInputRef}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] text-[#9CA3AF] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] text-[#9CA3AF] mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] text-[#9CA3AF] mb-1">Project</label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="">Personal</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_key} {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2 flex gap-2">
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] text-[#9CA3AF] mb-1">Division</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                disabled={!selectedProject}
                className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-2.5 py-2 text-xs text-white disabled:opacity-50"
              >
                {(selectedProject?.divisions || ['General']).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="self-end bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs px-3.5 py-2 rounded-lg transition shrink-0"
            >
              + Add Task
            </button>
          </div>
        </div>
      </form>

      {/* 3-Column Daily Board (Overdue | Due Today | Completed Today) */}
      {loading ? (
        <div className="mt-10 text-center text-xs text-[#9CA3AF]">Loading tasks...</div>
      ) : activeTab === 'today' ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: Overdue Reminders */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">
              Overdue Reminders ({overdueTasks.length})
            </h2>
            <div className="space-y-3">
              {overdueTasks.length === 0 ? (
                <div className="bg-[#151521] border border-dashed border-[#2A2A3D] rounded-xl p-6 text-center text-xs text-[#6B7280]">
                  No overdue reminders
                </div>
              ) : (
                overdueTasks.map((t) => renderTaskCard(t, 'overdue'))
              )}
            </div>
          </div>

          {/* Column 2: Due Today */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">
              Due Today ({dueTodayTasks.length})
            </h2>
            <div className="space-y-3">
              {dueTodayTasks.length === 0 ? (
                <div className="bg-[#151521] border border-dashed border-[#2A2A3D] rounded-xl p-6 text-center text-xs text-[#6B7280]">
                  Nothing pending for today
                </div>
              ) : (
                dueTodayTasks.map((t) => renderTaskCard(t, 'today'))
              )}
            </div>
          </div>

          {/* Column 3: Completed Today */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">
              Completed Today ({completedTodayTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTodayTasks.length === 0 ? (
                <div className="bg-[#151521] border border-dashed border-[#2A2A3D] rounded-xl p-6 text-center text-xs text-[#6B7280]">
                  Complete a task to log it here
                </div>
              ) : (
                completedTodayTasks.map((t) => renderTaskCard(t, 'done'))
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'overdue' ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {overdueTasks.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">No overdue tasks. Nice work!</p>
          ) : (
            overdueTasks.map((t) => renderTaskCard(t, 'overdue'))
          )}
        </div>
      ) : activeTab === 'upcoming' ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingTasks.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">No upcoming scheduled tasks.</p>
          ) : (
            upcomingTasks.map((t) => renderTaskCard(t, 'today'))
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allCompleted.length === 0 ? (
            <p className="text-xs text-[#9CA3AF]">No completed tasks yet.</p>
          ) : (
            allCompleted.map((t) => renderTaskCard(t, 'done'))
          )}
        </div>
        
      )}
      
    </div>
     </>
  );
}
