'use client';

import { Howl } from 'howler';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';

import { BLUNNO_MASCOT_PNG } from '@/lib/assets';
import { cn } from '@/lib/utils';

const TOTAL_CYCLES = 3;
const VIEW_SIZE = 320;
const CX = VIEW_SIZE / 2;
const CY = VIEW_SIZE / 2;
const R = 128;
/** Figma: 12px stroke — explicit in SVG (also used for circumference math) */
const STROKE_PX = 12;
const CIRC = 2 * Math.PI * R;
const TWO_PI = Math.PI * 2;

/** Glow: filter + outer halo (box-shadow on wrapper — у stroke нет box-shadow в SVG) */
const RING_PROGRESS_FILTER = 'drop-shadow(0 0 8px #00FFD1)';
const RING_WRAPPER_BOX_SHADOW =
  '0 0 20px rgba(0,255,209,0.5), 0 0 10px rgba(255,0,245,0.3)';

type ExerciseStatus = 'active' | 'completed';

function cycleFeedbackMessage(completedCycle: number): string {
  if (completedCycle === 1) return 'Хорошо! Круг 1 из 3';
  if (completedCycle === 2) return 'Отлично! Круг 2 из 3';
  return 'Последний круг! Ты справишься';
}

function getAngleFromClient(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  width: number,
  height: number,
  cx: number,
  cy: number
): number {
  const x = ((clientX - rect.left) / rect.width) * width;
  const y = ((clientY - rect.top) / rect.height) * height;
  return Math.atan2(x - cx, -(y - cy));
}

let dingSingleton: Howl | null = null;

function getDing(): Howl {
  if (typeof window === 'undefined') {
    return null as unknown as Howl;
  }
  if (!dingSingleton) {
    dingSingleton = new Howl({
      src: ['/sounds/ding.mp3'],
      volume: 0.4,
      onloaderror: () => {
        console.log('[SOS] ding.mp3 unavailable, skipping sound');
      },
    });
  }
  return dingSingleton;
}

export default function SosPage(): ReactElement {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastAngleRef = useRef<number | null>(null);
  const cycleProgressRef = useRef(0);
  const completedCyclesRef = useRef(0);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [exerciseStatus, setExerciseStatus] = useState<ExerciseStatus>('active');
  const [feedback, setFeedback] = useState<string>('');
  const isTrackingRef = useRef(false);

  useEffect(() => {
    document.title = 'SOS - Breathe with Blunno';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Три цикла дыхания вместе с Blunno');
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (isTrackingRef.current) e.preventDefault();
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  const applyCycleCompletion = useCallback((newCompleted: number) => {
    setFeedback(cycleFeedbackMessage(newCompleted));
    try {
      getDing().play();
    } catch {
      console.log('[SOS] could not play ding');
    }
    if (newCompleted >= TOTAL_CYCLES) {
      setExerciseStatus('completed');
      cycleProgressRef.current = 1;
      setCycleProgress(1);
    }
  }, []);

  const appendAngleDelta = useCallback(
    (deltaRad: number) => {
      if (completedCyclesRef.current >= TOTAL_CYCLES) return;

      let p = cycleProgressRef.current + deltaRad / TWO_PI;

      while (p >= 1 && completedCyclesRef.current < TOTAL_CYCLES) {
        p -= 1;
        completedCyclesRef.current += 1;
        const n = completedCyclesRef.current;
        setCompletedCycles(n);
        applyCycleCompletion(n);
      }

      while (p < 0) {
        p += 1;
      }

      if (completedCyclesRef.current >= TOTAL_CYCLES) {
        cycleProgressRef.current = 1;
        setCycleProgress(1);
        return;
      }

      cycleProgressRef.current = p;
      setCycleProgress(p);
    },
    [applyCycleCompletion]
  );

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isTrackingRef.current || completedCyclesRef.current >= TOTAL_CYCLES) return;
      const el = svgRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const a = getAngleFromClient(clientX, clientY, rect, VIEW_SIZE, VIEW_SIZE, CX, CY);
      if (lastAngleRef.current === null) {
        lastAngleRef.current = a;
        return;
      }
      let da = a - lastAngleRef.current;
      if (da > Math.PI) da -= TWO_PI;
      if (da < -Math.PI) da += TWO_PI;
      lastAngleRef.current = a;
      appendAngleDelta(da);
    },
    [appendAngleDelta]
  );

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (completedCyclesRef.current >= TOTAL_CYCLES) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isTrackingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const a = getAngleFromClient(e.clientX, e.clientY, rect, VIEW_SIZE, VIEW_SIZE, CX, CY);
    lastAngleRef.current = a;
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    isTrackingRef.current = false;
    lastAngleRef.current = null;
  };

  const resetExercise = () => {
    cycleProgressRef.current = 0;
    completedCyclesRef.current = 0;
    setCycleProgress(0);
    setCompletedCycles(0);
    setExerciseStatus('active');
    setFeedback('');
    isTrackingRef.current = false;
    lastAngleRef.current = null;
  };

  const dashArray = useMemo(() => {
    const drawn = CIRC * cycleProgress;
    return `${drawn} ${CIRC}`;
  }, [cycleProgress]);

  const currentCycleLabel = Math.min(completedCycles + 1, TOTAL_CYCLES);

  return (
    <main
      className={cn(
        'flex min-h-dvh min-h-screen flex-col overflow-hidden',
        'bg-[#0B0B1A] text-white',
        'px-4 pb-[max(1rem,env(safe-area-inset-bottom))]',
        'pt-[max(env(safe-area-inset-top),1rem)]'
      )}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-center gap-3">
        {/* Header: title + home */}
        <div className="relative flex w-full shrink-0 items-center justify-center px-10">
          <h1 className="text-center font-sans text-base font-extrabold uppercase leading-tight tracking-[0.12em] text-white sm:text-lg">
            <span className="[text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">BREATHE WITH </span>
            <span className="text-[#00FFD1] [text-shadow:0_0_24px_rgba(0,255,209,0.35)]">BLUNNO</span>
          </h1>
          <Link
            href="/choose"
            aria-label="Exit to mode selection"
            className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-[#1a1a2e]/90 text-white/95 shadow-[0_0_16px_rgba(0,255,209,0.12)] backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-[#252540]/95"
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
        </div>

        {/* Ring + Blunno: 90vw max, box-shadow halo; stroke 12px в user space */}
        <div
          className={cn(
            'relative mx-auto flex aspect-square w-[min(90vw,380px)] max-h-[90vw] max-w-[90vw] shrink-0 touch-none select-none items-center justify-center overflow-visible rounded-full',
            exerciseStatus === 'completed' && 'pointer-events-none opacity-[0.98]'
          )}
          style={{ boxShadow: RING_WRAPPER_BOX_SHADOW }}
        >
          <svg
            ref={svgRef}
            role="img"
            aria-label="Trace around the ring to fill the progress"
            viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
            className={cn(
              'absolute inset-0 z-10 size-full touch-none overflow-visible',
              exerciseStatus === 'active' && 'cursor-pointer'
            )}
            onPointerDown={onPointerDown}
            onPointerMove={(e) => {
              if (e.pointerType === 'mouse' && e.buttons !== 1) return;
              handlePointerMove(e.clientX, e.clientY);
            }}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse' && e.buttons === 0) onPointerUp(e);
            }}
          >
            <defs>
              <linearGradient
                id="sosRingGradient"
                gradientUnits="userSpaceOnUse"
                x1={0}
                y1={0}
                x2={VIEW_SIZE}
                y2={VIEW_SIZE}
              >
                <stop offset="0%" stopColor="#00FFD1" />
                <stop offset="100%" stopColor="#FF00F5" />
              </linearGradient>
            </defs>

            <g transform={`rotate(-90 ${CX} ${CY})`}>
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={STROKE_PX}
                strokeLinecap="round"
                vectorEffect="nonScalingStroke"
              />
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="url(#sosRingGradient)"
                strokeWidth={STROKE_PX}
                strokeLinecap="round"
                strokeDasharray={dashArray}
                vectorEffect="nonScalingStroke"
                style={{ filter: RING_PROGRESS_FILTER }}
              />
            </g>
          </svg>

          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center p-0">
            <motion.img
              src={BLUNNO_MASCOT_PNG}
              alt=""
              width={200}
              height={200}
              className="h-auto max-h-[min(72%,calc(100%-52px))] w-[min(72%,calc(100%-52px))] max-w-full object-contain object-center opacity-95"
              style={{ transformOrigin: '50% 50%' }}
              animate={{
                scale: [1, 1.09, 1],
                y: [0, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>

        {/* Cycle + hint / feedback */}
        <div className="flex w-full max-w-sm shrink-0 flex-col items-center gap-2 px-1 text-center">
          <p className="font-sans text-base font-semibold tracking-wide text-white/95">
            Cycle {exerciseStatus === 'completed' ? TOTAL_CYCLES : currentCycleLabel} of {TOTAL_CYCLES}
          </p>

          {feedback ? (
            <p className="max-w-sm text-base font-semibold leading-snug text-white/90" role="status">
              {feedback}
            </p>
          ) : (
            <p className="max-w-sm text-sm font-medium leading-relaxed text-white/65 sm:text-[15px]">
              Trace the ring with your finger or mouse until it fills.
            </p>
          )}
        </div>

        {exerciseStatus === 'completed' ? (
          <div className="mt-1 flex w-full max-w-sm shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="/choose"
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-5 py-3.5 text-center font-sans text-base font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-white/18"
            >
              Завершить
            </Link>
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#00FFD1]/45 bg-[#00FFD1]/12 px-5 py-3.5 font-sans text-base font-extrabold uppercase tracking-wide text-[#00FFD1] transition-colors hover:bg-[#00FFD1]/22"
              onClick={resetExercise}
            >
              Остаться
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
