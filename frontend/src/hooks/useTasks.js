import { useCallback, useEffect, useMemo, useState } from "react";
import * as taskService from "../services/taskService";

export const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const parseDateKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toKey = (value) => {
  if (!value) return null;
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : toDateKey(date);
};

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

function normalizeStatus(value) {
  const text = String(value ?? "").toLowerCase();
  if (text.includes("done") || text.includes("complete")) return "done";
  if (text.includes("progress")) return "in_progress";
  return "todo";
}

function normalizeTask(raw) {
  const status = normalizeStatus(raw.status);
  const completedValue =
    raw.completed_at ??
    raw.completedAt ??
    (status === "done" ? (raw.updated_at ?? raw.updatedAt) : null);

  return {
    ...raw,
    status,
    priority: String(raw.priority ?? "medium").toLowerCase(),
    dueDate: toKey(raw.due_date ?? raw.dueDate),
    completedDate: status === "done" ? toKey(completedValue) : null,
    projectName: raw.project_name ?? raw.projectName ?? raw.project?.name ?? "",
  };
}

const unwrapList = (data) => (Array.isArray(data) ? data : (data?.tasks ?? []));

const toMessage = (err) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  "Something went wrong. Please try again.";

export function useTasks({ autoLoad = true } = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks(params);
      setTasks(unwrapList(data).map(normalizeTask));
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) loadTasks();
  }, [autoLoad, loadTasks]);

  const addTask = useCallback(async (payload) => {
    const data = await taskService.createTask(payload);
    const task = normalizeTask(data?.task ?? data);
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const editTask = useCallback(async (id, changes) => {
    const data = await taskService.updateTask(id, changes);
    const fromServer = data?.task ?? data;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? normalizeTask(fromServer?.id ? fromServer : { ...t, ...changes })
          : t,
      ),
    );
  }, []);

  const removeTask = useCallback(async (id) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleComplete = useCallback(
    async (task) => {
      try {
        await editTask(task.id, {
          status: task.status === "done" ? "todo" : "done",
        });
      } catch (err) {
        setError(toMessage(err));
      }
    },
    [editTask],
  );

  const derived = useMemo(() => {
    const now = new Date();
    const todayKey = toDateKey(now);
    const isOpen = (t) => t.status !== "done";

    const dueToday = tasks.filter((t) => t.dueDate === todayKey);
    const overdueTasks = tasks.filter(
      (t) => isOpen(t) && t.dueDate && t.dueDate < todayKey,
    );
    const doneToday = tasks.filter(
      (t) => t.status === "done" && t.completedDate === todayKey,
    );

    const counts = {};
    tasks.forEach((t) => {
      if (t.status === "done" && t.completedDate) {
        counts[t.completedDate] = (counts[t.completedDate] || 0) + 1;
      }
    });
    const lastDays = Array.from({ length: 14 }, (_, i) =>
      toDateKey(
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - i)),
      ),
    );
    const sum = (keys) =>
      keys.reduce((total, k) => total + (counts[k] || 0), 0);

    const weeklyActivity = lastDays.slice(7).map((key) => ({
      date: key,
      day: parseDateKey(key).toLocaleDateString("en-US", { weekday: "short" }),
      count: counts[key] || 0,
    }));

    const priorityTasks = tasks
      .filter(
        (t) =>
          t.dueDate === todayKey ||
          (isOpen(t) && t.dueDate && t.dueDate < todayKey) ||
          (t.status === "done" && t.completedDate === todayKey),
      )
      .sort((a, b) => {
        if (isOpen(a) !== isOpen(b)) return isOpen(a) ? -1 : 1;
        const byPriority =
          (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
        if (byPriority !== 0) return byPriority;
        return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      });

    return {
      stats: {
        tasksToday: dueToday.length,
        completedToday: doneToday.length,
        overdue: overdueTasks.length,
        completedLast7: sum(lastDays.slice(7)),
        completedPrev7: sum(lastDays.slice(0, 7)),
      },
      overdueTasks,
      priorityTasks,
      weeklyActivity,
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    addTask,
    editTask,
    removeTask,
    toggleComplete,
    ...derived,
  };
}

export default useTasks;
