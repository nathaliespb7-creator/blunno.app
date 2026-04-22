'use client';

import Link from 'next/link';
import { useRef, useState, type ReactElement } from 'react';

import { playTaskCompleteInhale, unlockAudioSession } from '@/lib/navigationSound';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const DEFAULT_TASKS: Task[] = [
  { id: '1', text: 'Take a short walk', completed: false },
  { id: '2', text: 'Drink water', completed: false },
  { id: '3', text: 'Breathe deeply', completed: false },
  { id: '4', text: 'Stretch', completed: false },
  { id: '5', text: 'Write one good thing', completed: false },
];
const MAX_EXTRA = 3;
const MAX_TOTAL = DEFAULT_TASKS.length + MAX_EXTRA; // 8

type TasksMap = Record<string, Task[]>;

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function getWeekDays(dateKey: string, weekOffset: number = 0): Date[] {
  const [year, month, day] = dateKey.split('-').map(Number);
  const base = new Date(year, month - 1, day);
  const dayOfWeek = base.getDay(); // 0 sun
  const monday = new Date(base);
  monday.setDate(base.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  // Apply week offset
  monday.setDate(monday.getDate() + (weekOffset * 7));
  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

interface TodaySummaryCardProps {
  tasksMap: TasksMap;
  selectedKey: string;
  onJumpToToday: () => void;
}

function TodaySummaryCard({
  tasksMap,
  selectedKey,
  onJumpToToday,
}: TodaySummaryCardProps): ReactElement {
  const todayKey = getTodayKey();
  const todayTasks = tasksMap[todayKey] || [];
  const done = todayTasks.filter((t) => t.completed).length;
  const stars = done;
  const isViewingToday = selectedKey === todayKey;

  return (
    <section className="glass-card mb-1.5 w-full max-w-lg shrink-0 rounded-xl px-2.5 py-2 text-left sm:mx-auto sm:px-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Today&apos;s focus</p>
          <p className="mt-0.5 truncate text-sm font-bold text-white sm:text-base">
            {done} of {todayTasks.length} done
            <span className="ml-2 text-[#F5D9A6]" aria-label={`Stars: ${stars}`}>
              <span aria-hidden>★</span> {stars}
            </span>
          </p>
        </div>
        {!isViewingToday && (
          <button
            type="button"
            onClick={onJumpToToday}
            className="blunno-btn-primary blunno-focus-visible shrink-0 px-2.5 py-1 text-[11px] sm:text-xs"
          >
            Today
          </button>
        )}
      </div>
    </section>
  );
}

export default function PlannerPage(): ReactElement {
  const hasUnlockedAudioRef = useRef(false);
  const [selectedKey, setSelectedKey] = useState<string>(getTodayKey());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [tasksMap, setTasksMap] = useState<TasksMap>(() => {
    const today = getTodayKey();
    return { [today]: [...DEFAULT_TASKS.map(t => ({ ...t }))] };
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [editing, setEditing] = useState<{ day: string; index: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showLimitHint, setShowLimitHint] = useState(false);

  const currentTasks = tasksMap[selectedKey] || [];
  const weekDays = getWeekDays(selectedKey, weekOffset);
  const todayKey = getTodayKey();

  const goPrevWeek = () => {
    setWeekOffset(prev => prev - 1);
    // Set selected day to Monday of the new week
    const newWeekDays = getWeekDays(selectedKey, weekOffset - 1);
    const mondayKey = `${newWeekDays[0].getFullYear()}-${newWeekDays[0].getMonth() + 1}-${newWeekDays[0].getDate()}`;
    setSelectedKey(mondayKey);
  };

  const goNextWeek = () => {
    setWeekOffset(prev => prev + 1);
    // Set selected day to Monday of the new week
    const newWeekDays = getWeekDays(selectedKey, weekOffset + 1);
    const mondayKey = `${newWeekDays[0].getFullYear()}-${newWeekDays[0].getMonth() + 1}-${newWeekDays[0].getDate()}`;
    setSelectedKey(mondayKey);
  };

  const goCurrentWeek = () => {
    setWeekOffset(0);
    setSelectedKey(getTodayKey());
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    if (currentTasks.length >= MAX_TOTAL) {
      setShowLimitHint(true);
      setTimeout(() => setShowLimitHint(false), 3000);
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };
    setTasksMap(prev => ({
      ...prev,
      [selectedKey]: [...(prev[selectedKey] || []), newTask],
    }));
    setNewTaskText('');
  };

  const toggleCompleted = (index: number) => {
    setTasksMap(prev => {
      const tasks = [...(prev[selectedKey] || [])];
      const task = tasks[index];
      if (!task) return prev;
      const willBecomeComplete = !task.completed;
      tasks[index] = { ...task, completed: !task.completed };
      if (willBecomeComplete && typeof window !== 'undefined') {
        void unlockAudioSession();
        playTaskCompleteInhale();
      }
      return { ...prev, [selectedKey]: tasks };
    });
  };

  const startEdit = (index: number, text: string) => {
    setEditing({ day: selectedKey, index });
    setEditValue(text);
  };

  const saveEdit = () => {
    if (!editing) return;
    if (editValue.trim() === '') return;
    setTasksMap(prev => {
      const tasks = [...(prev[editing.day] || [])];
      tasks[editing.index] = { ...tasks[editing.index], text: editValue.trim() };
      return { ...prev, [editing.day]: tasks };
    });
    setEditing(null);
  };

  const onKeyDownEdit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditing(null);
  };

  const formatMonthRange = (week: Date[]): string => {
    const start = week[0];
    const end = week[6];
    const startMonth = start.toLocaleString('en-US', { month: 'long' });
    const endMonth = end.toLocaleString('en-US', { month: 'long' });
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  };

  return (
    <main
      onPointerDownCapture={() => {
        if (hasUnlockedAudioRef.current) return;
        hasUnlockedAudioRef.current = true;
        void unlockAudioSession();
      }}
      className={cn(
        'relative flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden overscroll-none text-white',
        'bg-blunno-bg',
        'px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]'
      )}
    >
      {/* Header — same structure as SOS / Play: home row, then centered title */}
      <div className="flex w-full shrink-0 justify-end">
        <Link
          href="/choose"
          aria-label="Exit to mode selection"
          className="blunno-focus-visible blunno-nav-btn text-white/95"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
      </div>
      <h1
        className={cn(
          'w-full shrink-0 py-1.5 text-center font-sans text-lg font-extrabold uppercase leading-tight tracking-figma [text-shadow:var(--shadow-text-title)]',
          'sm:text-xl md:text-[22px]',
          '[@media(max-height:620px)]:py-1 [@media(max-height:620px)]:text-base'
        )}
      >
        <span className="text-white">PLAN WITH </span>
        <span className="text-[var(--color-accent-primary)]">BLUNNO</span>
      </h1>

      {/* Today-first — primary block */}
      <TodaySummaryCard
        tasksMap={tasksMap}
        selectedKey={selectedKey}
        onJumpToToday={goCurrentWeek}
      />

      {/* Month range — secondary navigation */}
      <div className="flex shrink-0 items-center justify-between pb-2 pt-1">
        <button
          onClick={goPrevWeek}
          className="blunno-focus-visible flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-[var(--color-surface-1)] text-white/90 shadow-sm backdrop-blur-sm transition-colors hover:border-white/18 hover:bg-[var(--color-surface-2)]"
          aria-label="Previous week"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div className="text-center text-xs text-white/55 sm:text-sm">
          {formatMonthRange(weekDays)}
        </div>
        
        <button
          onClick={goNextWeek}
          className="blunno-focus-visible flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-[var(--color-surface-1)] text-white/90 shadow-sm backdrop-blur-sm transition-colors hover:border-white/18 hover:bg-[var(--color-surface-2)]"
          aria-label="Next week"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Week strip — calendar context (secondary) */}
      <div className="shrink-0 pb-3">
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-white/40">Week</p>
        <div className="flex justify-between gap-1">
          {weekDays.map((date, idx) => {
            const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            const isSelected = dayKey === selectedKey;
            const isToday = dayKey === todayKey;
            const isWeekend = idx === 5 || idx === 6; // sat, sun
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedKey(dayKey)}
                className={cn(
                  'blunno-focus-visible flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl border py-1.5 transition-all',
                  isSelected &&
                    'border-[var(--color-accent-primary)]/75 bg-[var(--planner-day-selected-bg)] shadow-[inset_0_0_0_1px_rgba(94,234,212,0.2)]',
                  !isSelected &&
                    isToday &&
                    'border-[var(--planner-day-today-ring)] bg-[var(--planner-day-bg)] shadow-[0_0_0_1px_rgba(251,191,36,0.25)]',
                  !isSelected &&
                    !isToday &&
                    isWeekend &&
                    'border-amber-500/30 bg-amber-950/45 hover:border-amber-400/45',
                  !isSelected &&
                    !isToday &&
                    !isWeekend &&
                    'border-[var(--planner-day-border)] bg-[var(--planner-day-bg)] hover:border-white/28 hover:bg-white/[0.08]'
                )}
              >
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isSelected && 'text-[var(--color-accent-primary)]',
                    !isSelected && isWeekend && 'text-amber-100/80',
                    !isSelected && !isWeekend && 'text-white/65'
                  )}
                >
                  {date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()}
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isSelected && 'text-white',
                    !isSelected && isWeekend && 'text-amber-50',
                    !isSelected && !isWeekend && 'text-white/92'
                  )}
                >
                  {date.getDate()}
                </span>
                {isToday && !isSelected && (
                  <span className="mt-0.5 h-1 w-1 rounded-full bg-amber-400/90" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list — scroll; Add stays fixed below */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <div className="space-y-1.5 pb-2">
          {currentTasks.map((task, idx) => (
            <div
              key={task.id}
              className={cn(
                'flex min-w-0 items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 transition',
                'border-white/10 bg-[var(--color-surface-1)] backdrop-blur-sm',
                task.completed && 'border-white/8 bg-white/[0.05] opacity-90'
              )}
            >
              {editing && editing.day === selectedKey && editing.index === idx ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={onKeyDownEdit}
                    autoFocus
                    className="min-w-0 flex-1 bg-transparent text-base text-white outline-none touch-manipulation"
                    style={{
                      minHeight: '44px',
                      fontSize: '16px', // Prevents zoom on iOS
                      WebkitAppearance: 'none',
                      borderRadius: 0
                    }}
                  />
                  <label className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleCompleted(idx)}
                      className="peer sr-only"
                      aria-label={task.completed ? `Mark "${task.text}" as not done` : `Mark "${task.text}" as done`}
                    />
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-focus-ring)]',
                        task.completed
                          ? 'border-[var(--color-accent-primary)]/50 bg-[var(--color-accent-primary)]/15 shadow-none'
                          : 'border-white/28 bg-transparent'
                      )}
                    >
                      {task.completed && (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </label>
                </>
              ) : (
                <>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEdit(idx, task.text);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEdit(idx, task.text);
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEdit(idx, task.text);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        startEdit(idx, task.text);
                      }
                    }}
                    className={`min-w-0 flex-1 cursor-text break-words text-sm touch-manipulation select-none sm:text-base ${task.completed ? 'text-white opacity-60 line-through' : 'text-white'}`}
                    style={{ 
                      minHeight: '44px', 
                      display: 'flex', 
                      alignItems: 'center',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    {task.text}
                  </span>
                  <button
                    type="button"
                    aria-label={`Edit task: ${task.text}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEdit(idx, task.text);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEdit(idx, task.text);
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEdit(idx, task.text);
                    }}
                    className="flex h-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-white/85 hover:text-white active:opacity-80 touch-manipulation"
                    style={{
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                  </button>
                  <label className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleCompleted(idx)}
                      className="peer sr-only"
                      aria-label={task.completed ? `Mark "${task.text}" as not done` : `Mark "${task.text}" as done`}
                    />
                    <span
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-focus-ring)]',
                        task.completed
                          ? 'border-[var(--color-accent-primary)]/50 bg-[var(--color-accent-primary)]/15 shadow-none'
                          : 'border-white/28 bg-transparent'
                      )}
                    >
                      {task.completed && (
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </label>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add task input – fixed at bottom */}
      <div className="shrink-0 border-t border-white/10 py-2.5">
        {showLimitHint && (
          <div className="mb-3 rounded-xl bg-orange-500/20 border border-orange-500/30 px-3 py-2">
            <p className="text-xs text-orange-200 text-center">
              You can add up to {MAX_EXTRA} extra tasks (max {MAX_TOTAL} total)
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
              }
            }}
            placeholder="Add a new task..."
            className="blunno-focus-visible flex-1 rounded-xl border border-white/10 bg-[var(--color-surface-1)] px-4 py-2 text-white placeholder-white/40 outline-none transition-all focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            maxLength={60}
            disabled={currentTasks.length >= MAX_TOTAL}
          />
          <button
            type="button"
            onClick={addTask}
            disabled={currentTasks.length >= MAX_TOTAL || !newTaskText.trim()}
            className={cn(
              'blunno-focus-visible rounded-xl px-4 py-2 font-semibold transition-all min-h-[44px]',
              currentTasks.length >= MAX_TOTAL || !newTaskText.trim()
                ? 'cursor-not-allowed bg-white/8 text-white/35'
                : 'blunno-btn-primary border-0 py-2'
            )}
          >
            Add
          </button>
        </div>
        {currentTasks.length >= MAX_TOTAL && !showLimitHint && (
          <p className="mt-2 text-xs text-white/50 text-center">Max {MAX_TOTAL} tasks per day</p>
        )}
      </div>
    </main>
  );
}
