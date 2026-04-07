'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';

import { playTaskCompleteInhale, unlockAudioSession } from '@/lib/navigationSound';

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

export default function PlannerPage(): ReactElement {
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
        unlockAudioSession();
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

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
    <main className="relative flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden overscroll-none bg-[#0B0B1A] text-white pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="relative flex w-full shrink-0 items-center justify-between px-4 pb-2">
        <h1 className="text-xl font-bold tracking-wide">PLANNER</h1>
        <Link
          href="/choose"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#1a1a2e]/90 text-white/95 shadow-md backdrop-blur-sm"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
      </div>

      {/* Month range with navigation */}
      <div className="shrink-0 px-4 pb-2 flex items-center justify-between">
        <button
          onClick={goPrevWeek}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-[#1a1a2e]/90 text-white/95 shadow-md backdrop-blur-sm hover:border-white/25 hover:bg-[#1a1a2e] transition-colors"
          aria-label="Previous week"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div className="text-sm text-white/70 text-center">
          {formatMonthRange(weekDays)}
        </div>
        
        <button
          onClick={goNextWeek}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-[#1a1a2e]/90 text-white/95 shadow-md backdrop-blur-sm hover:border-white/25 hover:bg-[#1a1a2e] transition-colors"
          aria-label="Next week"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Week strip */}
      <div className="shrink-0 px-2 pb-4">
        <div className="flex justify-between gap-1">
          {weekDays.map((date, idx) => {
            const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            const isSelected = dayKey === selectedKey;
            const isWeekend = idx === 5 || idx === 6; // sat, sun
            return (
              <button
                key={idx}
                onClick={() => setSelectedKey(dayKey)}
                className={`flex flex-1 flex-col items-center rounded-2xl py-2 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500/40 to-purple-500/40 shadow-md'
                    : isWeekend
                    ? 'border border-white/12 bg-gradient-to-br from-[#2a3318]/90 to-[#4a5c32]/85 hover:border-lime-200/20 hover:brightness-105'
                    : 'bg-[#1E1E2F]'
                }`}
              >
                <span className="text-xs font-medium text-white/70">
                  {date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase()}
                </span>
                <span className="text-lg font-semibold">{date.getDate()}</span>
                <div className="mt-1 h-1 w-1 rounded-full bg-white/50" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list – scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4">
        <div className="space-y-2 pb-2">
          {currentTasks.map((task, idx) => (
            <div
              key={task.id}
              className={`flex min-w-0 items-center justify-between gap-2 rounded-2xl border p-3 transition ${
                task.completed
                  ? 'border-white/10 bg-gradient-to-r from-[#2A1C29] to-[#905E8C]'
                  : 'border-white/12 bg-[linear-gradient(to_right,rgba(11,79,102,0.9)_5%,rgba(22,159,204,0.78)_90%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]'
              }`}
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
                    className="min-w-0 flex-1 bg-transparent text-base text-white outline-none"
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
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400/60 ${
                        task.completed
                          ? 'border-transparent bg-gradient-to-br from-[#2A1C29] to-[#905E8C] shadow-[0_2px_10px_rgba(42,28,41,0.4)]'
                          : 'border-white/30 bg-transparent'
                      }`}
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
                    onClick={() => startEdit(idx, task.text)}
                    onTouchStart={() => startEdit(idx, task.text)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        startEdit(idx, task.text);
                      }
                    }}
                    className={`min-w-0 flex-1 cursor-text break-words text-base touch-manipulation ${task.completed ? 'text-white opacity-60 line-through' : 'text-white'}`}
                  >
                    {task.text}
                  </span>
                  <button
                    type="button"
                    aria-label={`Edit task: ${task.text}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(idx, task.text);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      startEdit(idx, task.text);
                    }}
                    className="flex h-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-white/85 hover:text-white active:opacity-80"
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
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400/60 ${
                        task.completed
                          ? 'border-transparent bg-gradient-to-br from-[#2A1C29] to-[#905E8C] shadow-[0_2px_10px_rgba(42,28,41,0.4)]'
                          : 'border-white/30 bg-transparent'
                      }`}
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
      <div className="shrink-0 border-t border-white/10 p-4">
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
            className="flex-1 rounded-xl bg-[#1a1a2e] px-4 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            maxLength={60}
            disabled={currentTasks.length >= MAX_TOTAL}
          />
          <button
            onClick={addTask}
            disabled={currentTasks.length >= MAX_TOTAL || !newTaskText.trim()}
            className={`rounded-xl px-4 py-2 font-medium transition-all ${
              currentTasks.length >= MAX_TOTAL || !newTaskText.trim()
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
            }`}
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
