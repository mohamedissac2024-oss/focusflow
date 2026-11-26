import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import projectService from '../services/projectService';
import AppHeader from "../components/layout/AppHeader"

const COLUMNS = [
  { id: 'todo', label: 'To Do', countStyle: 'bg-[#232336] text-slate-300' },
  { id: 'in_progress', label: 'In Progress', countStyle: 'bg-sky-500/20 text-sky-300' },
  { id: 'in_review', label: 'In Review', countStyle: 'bg-amber-500/20 text-amber-300' },
  { id: 'done', label: 'Done', countStyle: 'bg-emerald-500/20 text-emerald-300' },
];

const ISSUE_TYPES = {
  epic: { label: 'Epic', badge: 'bg-amber-500 text-black font-semibold', icon: '⚡' },
  story: { label: 'Story', badge: 'bg-sky-500 text-black font-semibold', icon: '📘' },
  task: { label: 'Task', badge: 'bg-[#1F2433] text-slate-200 border border-slate-600/50', icon: '✓' },
  bug: { label: 'Bug', badge: 'bg-rose-500 text-white font-semibold', icon: '🐞' },
};

const DIVISION_ACCENTS = [
  'bg-sky-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-indigo-400',
];

export default function Projects() {
  const params = new URLSearchParams(window.location.search);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(
    params.get('projectId') ? Number(params.get('projectId')) : null
  );
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    project_key: '',
    description: '',
    github_repo: '',
    divisions: 'Architecture, Backend API, Frontend UI, QA & Testing',
  });

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    division: 'Backend API',
    issue_type: 'task',
    priority: 'medium',
    story_points: 3,
    status: 'todo',
    due_date: '',
  });

  const loadProjects = async (keepSelection = true) => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjects();
      const list = Array.isArray(data) ? data : data?.projects || [];
      setProjects(list);
      if (list.length > 0) {
        if (!keepSelection || !selectedProjectId || !list.some((p) => p.id === selectedProjectId)) {
          setSelectedProjectId(list[0].id);
        }
      } else {
        setSelectedProjectId(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(Boolean(selectedProjectId));
  }, []);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const filteredTasks = useMemo(() => {
    if (!activeProject) return [];
    return (activeProject.tasks || []).filter(
      (t) => selectedDivision === 'ALL' || (t.division || 'General') === selectedDivision
    );
  }, [activeProject, selectedDivision]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const created = await projectService.createProject(projectForm);
      setShowProjectModal(false);
      setProjectForm({
        name: '',
        project_key: '',
        description: '',
        github_repo: '',
        divisions: 'Architecture, Backend API, Frontend UI, QA & Testing',
      });
      await loadProjects(false);
      if (created?.id) setSelectedProjectId(created.id);
    } catch (err) {
      setError(err.message || 'Could not create project.');
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    try {
      setError('');
      await api.post('/tasks', {
        ...issueForm,
        project_id: activeProject.id,
        story_points: Number(issueForm.story_points) || 1,
      });
      setShowIssueModal(false);
      await loadProjects(true);
    } catch (err) {
      setError(err.message || 'Could not create issue.');
    }
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: nextStatus });
      await loadProjects(true);
    } catch (err) {
      setError(err.message || 'Failed to move issue.');
    }
  };

  const openIssueModal = (status = 'todo', divOverride = null) => {
    setIssueForm({
      title: '',
      description: '',
      division:
        divOverride ||
        (selectedDivision !== 'ALL' ? selectedDivision : activeProject?.divisions?.[0] || 'General'),
      issue_type: 'task',
      priority: 'medium',
      story_points: 3,
      status,
      due_date: '',
    });
    setShowIssueModal(true);
  };

  return (
    <>
    <AppHeader />

    <div className="p-6 bg-[#0B0B12] min-h-screen text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#9CA3AF] font-semibold">
            Developer Integration
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-0.5">Projects &amp; Divisions</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {projects.length > 0 && (
            <select
              value={selectedProjectId || ''}
              onChange={(e) => {
                setSelectedProjectId(Number(e.target.value));
                setSelectedDivision('ALL');
              }}
              className="bg-[#151521] border border-[#2A2A3D] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.project_key}] {p.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowProjectModal(true)}
            className="bg-[#1A1A28] hover:bg-[#232336] border border-[#2A2A3D] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition"
          >
            + New Project
          </button>
          {activeProject && (
            <button
              onClick={() => openIssueModal('todo')}
              className="bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold px-3.5 py-2 rounded-lg transition"
            >
              + Create Issue
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 text-center text-[#9CA3AF]">Loading project workspace...</div>
      ) : !activeProject ? (
        <div className="mt-10 bg-[#151521] border border-[#2A2A3D] rounded-xl p-10 text-center max-w-lg mx-auto">
          <h2 className="text-lg font-bold">No projects yet</h2>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Create a project with custom divisions to start organizing issues.
          </p>
          <button
            onClick={() => setShowProjectModal(true)}
            className="mt-4 bg-cyan-400 text-black font-bold text-xs px-4 py-2 rounded-lg"
          >
            + Create First Project
          </button>
        </div>
      ) : (
        <>
          {/* 5 KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">
                Completion Rate:{' '}
                <span className="text-emerald-400 font-bold">
                  {activeProject.insights?.completion_rate ?? 0}%
                </span>
              </p>
              <div className="w-full h-2 bg-[#0B0B12] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${activeProject.insights?.completion_rate ?? 0}%` }}
                />
              </div>
            </div>

            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">Total Issues:</p>
              <p className="text-2xl font-bold mt-1">
                {activeProject.insights?.total_issues ?? 0}
              </p>
            </div>

            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">
                Active Issues:{' '}
                <span className="text-emerald-400 font-bold">
                  {(activeProject.insights?.in_progress ?? 0) +
                    (activeProject.insights?.in_review ?? 0)}
                </span>
              </p>
              <p className="text-xs text-[#9CA3AF] mt-2">
                In Progress:{' '}
                <span className="text-sky-400 font-semibold">
                  {activeProject.insights?.in_progress ?? 0}
                </span>{' '}
                &nbsp; Review:{' '}
                <span className="text-amber-400 font-semibold">
                  {activeProject.insights?.in_review ?? 0}
                </span>
              </p>
            </div>

            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">Overdue:</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {activeProject.insights?.overdue ?? 0}
              </p>
            </div>

            <div className="bg-[#151521] border border-[#2A2A3D] rounded-xl p-4">
              <p className="text-xs text-[#9CA3AF]">Focus Hours:</p>
              <p className="text-2xl font-bold mt-1">
                {activeProject.insights?.focus_hours ?? 0}h
              </p>
            </div>
          </div>

          {/* Divisions (Workstreams) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">Divisions (Workstreams)</h2>
              {selectedDivision !== 'ALL' && (
                <button
                  onClick={() => setSelectedDivision('ALL')}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Show All Divisions
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(activeProject.division_breakdown || []).map((div, idx) => {
                const barColor = DIVISION_ACCENTS[idx % DIVISION_ACCENTS.length];
                const isSelected = selectedDivision === div.name;
                return (
                  <button
                    key={div.name}
                    onClick={() => setSelectedDivision(isSelected ? 'ALL' : div.name)}
                    className={`text-left bg-[#151521] rounded-xl p-4 border transition ${
                      isSelected
                        ? 'border-cyan-400 ring-1 ring-cyan-400/40'
                        : 'border-[#2A2A3D] hover:border-[#3E3E58]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm text-white">{div.name}</p>
                        <p className="text-xs text-sky-400 mt-0.5">{div.progress}% done</p>
                      </div>
                      <span className="text-xs font-mono text-[#9CA3AF]">
                        {div.done}/{div.total}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0B0B12] rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all`}
                        style={{ width: `${div.progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-Column Kanban Board with High-Contrast Issue Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-[#12121C] border border-[#232336] rounded-xl p-3 flex flex-col min-h-[420px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-1 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{col.label}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono ${col.countStyle}`}
                      >
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => openIssueModal(col.id)}
                      className="text-xs text-[#9CA3AF] hover:text-white px-2 py-0.5 rounded hover:bg-[#1E1E2E]"
                      title={`Add issue to ${col.label}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Crisp White Jira-style Cards */}
                  <div className="space-y-3 flex-1">
                    {colTasks.length === 0 ? (
                      <div className="text-xs text-[#6B7280] text-center py-8 border border-dashed border-[#2A2A3D] rounded-lg">
                        No issues
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const meta = ISSUE_TYPES[task.issue_type] || ISSUE_TYPES.task;
                        return (
                          <div
                            key={task.id}
                            className="bg-[#F8FAFC] text-slate-900 rounded-lg p-3.5 shadow-md border border-slate-200"
                          >
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="font-semibold">
                                {meta.icon} {meta.label}
                              </span>
                              <span className="font-mono font-bold text-indigo-600">
                                {task.issue_key}
                              </span>
                            </div>

                            <p className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                              {task.issue_key}: {task.title}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                              <span className={`text-[11px] px-2 py-0.5 rounded ${meta.badge}`}>
                                {meta.icon} {meta.label}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-white font-medium">
                                {task.division || 'General'}
                              </span>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                              <span
                                className={`font-semibold capitalize ${
                                  task.priority === 'high'
                                    ? 'text-rose-600'
                                    : task.priority === 'medium'
                                    ? 'text-amber-600'
                                    : 'text-slate-500'
                                }`}
                              >
                                ⚑ {task.priority}
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-slate-600">
                                  {task.story_points || 1} pts
                                </span>
                                <select
                                  value={task.status}
                                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                  className="bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-[11px] text-slate-800"
                                >
                                  {COLUMNS.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateProject}
            className="bg-[#151521] border border-[#2A2A3D] rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-bold">New Project</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-[#9CA3AF] mb-1">Project Name *</label>
                <input
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="FocusFlow v2"
                  className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Key</label>
                <input
                  maxLength={8}
                  value={projectForm.project_key}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, project_key: e.target.value.toUpperCase() })
                  }
                  placeholder="FF"
                  className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm font-mono uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Divisions (comma-separated)</label>
              <input
                value={projectForm.divisions}
                onChange={(e) => setProjectForm({ ...projectForm, divisions: e.target.value })}
                className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 text-xs text-[#9CA3AF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-cyan-400 text-black font-bold text-xs px-4 py-2 rounded-lg"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Issue Modal */}
      {showIssueModal && activeProject && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateIssue}
            className="bg-[#151521] border border-[#2A2A3D] rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-bold">Create Issue ({activeProject.project_key})</h2>
            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1">Issue Title *</label>
              <input
                required
                value={issueForm.title}
                onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                placeholder="Implement JWT Auth"
                className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Division</label>
                <select
                  value={issueForm.division}
                  onChange={(e) => setIssueForm({ ...issueForm, division: e.target.value })}
                  className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm"
                >
                  {(activeProject.divisions || ['General']).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Issue Type</label>
                <select
                  value={issueForm.issue_type}
                  onChange={(e) => setIssueForm({ ...issueForm, issue_type: e.target.value })}
                  className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="epic">⚡ Epic</option>
                  <option value="story">📘 Story</option>
                  <option value="task">✓ Task</option>
                  <option value="bug">🐞 Bug</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Priority</label>
                <select
                  value={issueForm.priority}
                  onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                  className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Points</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={issueForm.story_points}
                  onChange={(e) => setIssueForm({ ...issueForm, story_points: e.target.value })}
                  className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">Due Date</label>
                <input
                  type="date"
                  value={issueForm.due_date}
                  onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })}
                  className="w-full bg-[#0B0B12] border border-[#2A2A3D] rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 text-xs text-[#9CA3AF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-cyan-400 text-black font-bold text-xs px-4 py-2 rounded-lg"
              >
                Create Issue
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
      </>
  );
}
