'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactElement } from 'react';

import { cn } from '@/lib/utils';

type Task = {
  id: string;
  text: string;
  done: boolean;
};

const DEFAULT_TASK_COUNT = 5;
const MAX_EXTRA_TASKS = 3;
/** 5 seeded examples + up to 3 user-added = 8 total */
const MAX_TASKS_PER_DAY = DEFAULT_TASK_COUNT + MAX_EXTRA_TASKS;

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const EXAMPLE_TASKS: Task[] = [
  { id: 'seed-0', text: 'Take a short walk', done: false },
  { id: 'seed-1', text: 'Drink water', done: false },
  { id: 'seed-2', text: 'Breathe deeply', done: false },
  { id: 'seed-3', text: 'Stretch', done: false },
  { id: 'seed-4', text: 'Write one good thing', done: false },
];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatWeekRangeLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const y = monday.getFullYear();
  const month = monday.toLocaleDateString('en-US', { month: 'long' });
  if (monday.getMonth() === sunday.getMonth()) {
    return `${month} ${monday.getDate()} – ${sunday.getDate()}, ${y}`;
  }
  const start = monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const end = sunday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `${start} – ${end}, ${y}`;
}

function newTaskId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function PlannerPage(): ReactElement {
  const listId = useId();
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const weekMonday = useMemo(() => getMonday(new Date()), []);

  const weekDays = useMemo(() => {
    const days: { key: string; date: Date; dayNum: number; weekdayIndex: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekMonday);
      d.setDate(weekMonday.getDate() + i);
      days.push({
        key: toDateKey(d),
        date: d,
        dayNum: d.getDate(),
        weekdayIndex: i,
      });
    }
    return days;
  }, [weekMonday]);

  const weekLabel = useMemo(() => formatWeekRangeLabel(weekMonday), [weekMonday]);

  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [tasksByDay, setTasksByDay] = useState<Record<string, Task[]>>(() => ({
    [todayKey]: EXAMPLE_TASKS.map((t) => ({ ...t })),
  }));
  const [draft, setDraft] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [limitHint, setLimitHint] = useState(false);
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const tasksByDayRef = useRef(tasksByDay);
  tasksByDayRef.current = tasksByDay;

  const tasks = tasksByDay[selectedKey] ?? [];
  const taskCount = tasks.length;
  const atTaskLimit = taskCount >= MAX_TASKS_PER_DAY;
  const canAdd = !atTaskLimit && draft.trim().length > 0;

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTaskId]);

  useEffect(() => {
    if (!limitHint) return;
    const t = window.setTimeout(() => setLimitHint(false), 4000);
    return () => window.clearTimeout(t);
  }, [limitHint]);

  const toggleTask = useCallback((taskId: string) => {
    setTasksByDay((prev) => {
      const list = prev[selectedKey] ?? [];
      return {
        ...prev,
        [selectedKey]: list.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
      };
    });
  }, [selectedKey]);

  const saveTaskText = useCallback(
    (taskId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setTasksByDay((prev) => {
        const list = prev[selectedKey] ?? [];
        return {
          ...prev,
          [selectedKey]: list.map((t) => (t.id === taskId ? { ...t, text: trimmed } : t)),
        };
      });
    },
    [selectedKey]
  );

  const commitEdit = useCallback(() => {
    if (!editingTaskId) return;
    const trimmed = editBuffer.trim();
    if (trimmed) {
      saveTaskText(editingTaskId, trimmed);
    }
    setEditingTaskId(null);
    setEditBuffer('');
  }, [editBuffer, editingTaskId, saveTaskText]);

  const cancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditBuffer('');
  }, []);

  const startEdit = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditBuffer(task.text);
  }, []);

  /** Ref + functional update so limit checks match latest state (no stale closure). */
  const submitNewTask = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const currentList = tasksByDayRef.current[selectedKey] ?? [];
    if (currentList.length >= MAX_TASKS_PER_DAY) {
      setLimitHint(true);
      return;
    }
    setTasksByDay((prev) => {
      const list = prev[selectedKey] ?? [];
      if (list.length >= MAX_TASKS_PER_DAY) return prev;
      return {
        ...prev,
        [selectedKey]: [...list, { id: newTaskId(), text, done: false }],
      };
    });
    setDraft('');
  }, [draft, selectedKey]);

  return (
    <main
      className={cn(
        'relative flex h-dvh min-h-0 max-h-dvh w-full flex-col overflow-hidden overscroll-none bg-[#0B0B1A] text-white',
        '[contain:layout_style]',
        'px-4 sm:px-5',
        'pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]'
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 py-2">
        <h1
          className={cn(
            'font-sans text-lg font-extrabold uppercase leading-tight tracking-figma [text-shadow:var(--shadow-text-title)]',
            'sm:text-xl'
          )}
        >
          PLANNER
        </h1>
        <Link
          href="/choose"
          aria-label="Back to mode selection"
          className="rounded-xl border border-white/20 bg-white/5 p-2 text-white/90 transition-colors hover:border-white/35 hover:bg-white/10"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="3" width="11" height="18" rx="2" />
            <path d="M15 12h5" />
            <path d="M18 9l3 3-3 3" />
          </svg>
        </Link>
      </header>

      <p className="shrink-0 text-center font-sans text-xs font-medium text-white/55 sm:text-sm">
        {weekLabel}
      </p>

      <div
        className="mt-2 flex shrink-0 justify-between gap-1 sm:gap-1.5"
        role="tablist"
        aria-label="This week"
      >
        {weekDays.map(({ key, dayNum, weekdayIndex }) => {
          const selected = key === selectedKey;
          const isToday = key === todayKey;
          const isWeekend = weekdayIndex >= 5;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSelectedKey(key)}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center rounded-xl border px-0.5 py-2 transition-colors duration-200 sm:px-1',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB8FF]/40',
                selected
                  ? 'border-[#5B8FD9]/55 bg-gradient-to-r from-blue-500/30 to-purple-500/30 shadow-[0_4px_20px_rgba(60,100,160,0.25)]'
                  : isWeekend
                    ? 'border-white/12 bg-gradient-to-br from-[#2a3318]/90 to-[#4a5c32]/85 hover:border-lime-200/20 hover:brightness-105'
                    : 'border-white/12 bg-[#1E1E2F] hover:border-white/20 hover:bg-[#2a2a3d]'
              )}
            >
              <span className="font-sans text-sm font-bold tabular-nums text-white sm:text-base">
                {dayNum}
              </span>
              <span
                className={cn(
                  'mt-0.5 text-[10px] font-medium uppercase tracking-wide sm:text-[11px]',
                  selected ? 'text-white/80' : isWeekend ? 'text-white/75' : 'text-white/80'
                )}
              >
                {WEEKDAY_LABELS[weekdayIndex]}
              </span>
              <span
                className={cn(
                  'mt-1 h-1 w-1 rounded-full',
                  isToday ? 'bg-[#E8D44A]/90' : 'bg-[#6B9BD9]/70',
                  selected && 'opacity-100'
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <p className="shrink-0 text-center font-sans text-xs text-white/50">
          Gentle list for {selectedKey === todayKey ? 'today' : 'this day'} — no rush.
        </p>

        <ul
          id={listId}
          className="max-h-[280px] min-h-0 shrink overflow-y-auto overscroll-contain space-y-2 pr-0.5 touch-pan-y"
        >
          {tasks.length === 0 ? (
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-white/50">
              Nothing here yet. Add a small step when you’re ready.
            </li>
          ) : (
            tasks.map((task) => (
              <li key={task.id}>
                <div
                  className={cn(
                    'flex items-stretch gap-2 transition-all duration-300 ease-out',
                    task.done &&
                      'rounded-2xl border border-white/15 bg-gradient-to-r from-[#2A1C29] to-[#905E8C] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-4 sm:py-3'
                  )}
                >
                  <div
                    className={cn(
                      'min-w-0 flex-1',
                      !task.done &&
                        'rounded-2xl border border-white/10 bg-[linear-gradient(to_right,rgba(11,79,102,0.84)_5%,rgba(22,159,204,0.84)_90%)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-4 sm:py-3'
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-1.5">
                      {editingTaskId === task.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editBuffer}
                          onChange={(e) => setEditBuffer(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitEdit();
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                          maxLength={120}
                          className={cn(
                            'min-w-0 flex-1 rounded-lg border border-white/25 bg-black/20 px-2 py-1 font-sans text-sm font-medium leading-snug text-white outline-none sm:text-base',
                            'focus:border-[#6B9BD9]/55 focus:shadow-[0_0_0_2px_rgba(100,140,200,0.2)]'
                          )}
                          aria-label="Edit task text"
                        />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(task)}
                            className={cn(
                              'min-w-0 flex-1 text-left font-sans text-sm font-medium leading-snug transition-opacity duration-300 sm:text-base',
                              'rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB8FF]/40',
                              task.done ? 'text-white/70 line-through decoration-white/30' : 'text-white/95'
                            )}
                          >
                            {task.text}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(task);
                            }}
                            aria-label={`Edit “${task.text}”`}
                            className="mt-0.5 shrink-0 rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB8FF]/40"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-pressed={task.done}
                    className={cn(
                      'flex w-12 shrink-0 items-center justify-center rounded-2xl',
                      'transition-transform duration-200 active:scale-[0.97]',
                      'hover:opacity-95',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A0D9]/45'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ease-out',
                        task.done
                          ? 'border-transparent bg-gradient-to-br from-[#2A1C29] to-[#905E8C] shadow-[0_2px_10px_rgba(42,28,41,0.4)]'
                          : 'border-white/30 bg-transparent'
                      )}
                    >
                      {task.done ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="flex shrink-0 flex-col gap-1.5 pt-1">
          {limitHint && (
            <p
              className="text-center font-sans text-xs leading-snug text-[#B8C5E8]/90"
              role="status"
            >
              You can add up to 3 extra tasks (max 8 total).
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNewTask();
              }}
              placeholder="Add a gentle task…"
              maxLength={120}
              enterKeyHint="done"
              disabled={atTaskLimit}
              className={cn(
                'min-w-0 flex-1 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2.5 font-sans text-sm text-white placeholder:text-white/35',
                'outline-none transition-[border,box-shadow] duration-200',
                'focus:border-[#6B9BD9]/45 focus:shadow-[0_0_0_3px_rgba(100,140,200,0.15)]',
                atTaskLimit && 'cursor-not-allowed opacity-50'
              )}
              aria-label="New task"
            />
            <button
              type="button"
              onClick={submitNewTask}
              disabled={!canAdd || atTaskLimit}
              className={cn(
                'shrink-0 rounded-xl border border-[#6B9BD9]/35 bg-[#4A6FA8]/40 px-4 py-2.5 font-sans text-sm font-semibold text-white/95',
                'transition-[transform,opacity,background] duration-200',
                'hover:bg-[#5A7FB8]/55 active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EB8FF]/45',
                (!canAdd || atTaskLimit) && 'cursor-not-allowed opacity-40'
              )}
            >
              Add
            </button>
          </div>
          {atTaskLimit && !limitHint && (
            <p className="text-center font-sans text-[11px] text-white/40">
              8 tasks max — remove or complete one to add more.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
