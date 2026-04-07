'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';

import { BLUNNO_MASCOT_PNG } from '@/lib/assets';
import { getExhaleSound } from '@/lib/navigationSound';
import { cn } from '@/lib/utils';

const TOTAL_CYCLES = 3;
const VIEW_SIZE = 320;
const CX = VIEW_SIZE / 2;
const CY = VIEW_SIZE / 2;
const TWO_PI = Math.PI * 2;

type ExerciseStatus = 'active' | 'completed';

type VisualTuning = {
  ringDiameterPx: number;
  strokeWidthPx: number;
  blurPx: number;
  glowColor: string;
  blunnoSizePx: number;
  blunnoOffsetXPx: number;
  blunnoOffsetYPx: number;
  sectionGapPx: number;
};

const DEFAULT_TUNING: VisualTuning = {
  ringDiameterPx: 252,
  strokeWidthPx: 28,
  blurPx: 21,
  glowColor: '#00FFD1',
  blunnoSizePx: 120,
  blunnoOffsetXPx: -5,
  blunnoOffsetYPx: -13,
  /** Gap between ring, cycle/hint, and buttons (inner column only; header uses Choose `gap-3`) */
  sectionGapPx: 16,
};

const tuning = DEFAULT_TUNING;

function cycleFeedbackMessage(completedCycle: number): string {
  if (completedCycle === 1) return 'Nice! Cycle 1 of 3';
  if (completedCycle === 2) return 'Great! Cycle 2 of 3';
  return 'Last round! You’ve got this.';
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function buildRingFilters(blurPx: number, glowHex: string): { progress: string; wrapper: string } {
  const rgb = hexToRgb(glowHex);
  const fallback = '0, 255, 209';
  const rgba = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : fallback;
  const progress = [
    `drop-shadow(0 0 ${blurPx}px ${glowHex})`,
    `drop-shadow(0 0 ${blurPx * 2.5}px rgba(${rgba}, 0.45))`,
    'drop-shadow(0 0 10px rgba(255,0,245,0.35))',
  ].join(' ');
  const wrapper = `0 0 ${blurPx * 2.5}px rgba(${rgba}, 0.5), 0 0 12px rgba(255,0,245,0.3)`;
  return { progress, wrapper };
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

  const { ringRadius, strokeView, circ } = useMemo(() => {
    const d = Math.max(120, Math.min(tuning.ringDiameterPx, 480));
    const swPx = Math.max(2, Math.min(tuning.strokeWidthPx, 40));
    const sw = (swPx * VIEW_SIZE) / d;
    const rr = VIEW_SIZE / 2 - sw / 2;
    const r = Math.max(8, rr);
    const c = 2 * Math.PI * r;
    return { ringRadius: r, strokeView: sw, circ: c };
  }, [tuning.ringDiameterPx, tuning.strokeWidthPx]);

  const ringFilters = useMemo(
    () => buildRingFilters(tuning.blurPx, tuning.glowColor),
    [tuning.blurPx, tuning.glowColor]
  );

  useEffect(() => {
    document.title = 'SOS - Breathe with Blunno';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Three breathing cycles with Blunno');
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
      getExhaleSound()?.play();
    } catch {
      console.log('[SOS] could not play exhale');
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
    const drawn = circ * cycleProgress;
    return `${drawn} ${circ}`;
  }, [circ, cycleProgress]);

  const currentCycleLabel = Math.min(completedCycles + 1, TOTAL_CYCLES);

  const ringSizeStyle = {
    width: tuning.ringDiameterPx,
    height: tuning.ringDiameterPx,
    maxWidth: 'min(90vw, 100%)',
    maxHeight: 'min(90vw, 55dvh)',
    boxShadow: ringFilters.wrapper,
  } as const;

  const ringTextColumnStyle = { gap: tuning.sectionGapPx } as const;

  return (
    <main
      className={cn(
        'flex min-h-screen min-h-dvh max-h-dvh flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain',
        'bg-blunno-bg text-blunno-foreground',
        'px-4 py-4 sm:px-5 sm:py-6',
        '[@media(max-height:620px)]:py-3',
        'pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]'
      )}
    >
      <div
        className={cn(
          'mx-auto flex min-h-0 min-w-0 w-full max-w-4xl flex-1 flex-col items-center justify-center gap-3',
          '[@media(max-height:620px)]:justify-start [@media(max-height:620px)]:gap-2'
        )}
      >
        <div className="flex w-full shrink-0 justify-end">
          <Link
            href="/choose"
            aria-label="Exit to mode selection"
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
        </div>

        <h1
          className={cn(
            'w-full shrink-0 py-2 text-center font-sans text-lg font-extrabold uppercase leading-tight tracking-figma [text-shadow:var(--shadow-text-title)]',
            'sm:text-xl md:text-[22px]',
            '[@media(max-height:620px)]:py-1 [@media(max-height:620px)]:text-base'
          )}
        >
          <span className="text-white">BREATHE WITH </span>
          <span className="text-[#00FFD1]">BLUNNO</span>
        </h1>

        <div
          className={cn(
            'flex min-h-0 w-full flex-1 flex-col items-stretch justify-center py-1 [@media(max-height:620px)]:py-0',
            'touch-none select-none'
          )}
          aria-label="SOS breathing exercise"
        >
          <div
            className="mx-auto flex w-full max-w-sm flex-col items-center"
            style={ringTextColumnStyle}
          >
          <div
            className={cn(
              'relative mx-auto flex shrink-0 items-center justify-center overflow-visible rounded-full aspect-square',
              exerciseStatus === 'completed' && 'pointer-events-none opacity-[0.98]'
            )}
            style={ringSizeStyle}
          >
          <svg
            ref={svgRef}
            role="img"
            aria-label="Trace around the ring to fill the progress"
            viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
            preserveAspectRatio="xMidYMid meet"
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
                r={ringRadius}
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth={strokeView}
                strokeLinecap="round"
              />
              <circle
                cx={CX}
                cy={CY}
                r={ringRadius}
                fill="none"
                stroke="url(#sosRingGradient)"
                strokeWidth={strokeView}
                strokeLinecap="round"
                strokeDasharray={dashArray}
                style={{ filter: ringFilters.progress }}
              />
            </g>
          </svg>

          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <div
              style={{
                transform: `translate(${tuning.blunnoOffsetXPx}px, ${tuning.blunnoOffsetYPx}px)`,
              }}
            >
              <motion.img
                src={BLUNNO_MASCOT_PNG}
                alt="Blunno character"
                width={tuning.blunnoSizePx}
                height={tuning.blunnoSizePx}
                draggable={false}
                className="max-h-full max-w-full object-contain object-center"
                style={{ width: tuning.blunnoSizePx, height: tuning.blunnoSizePx }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.5, 1],
                }}
              />
            </div>
          </div>
          </div>

          <div className="flex w-full shrink-0 flex-col items-center gap-1 px-1 text-center">
            <p className="font-sans text-sm font-semibold tracking-wide text-white/95 sm:text-base">
              Cycle {exerciseStatus === 'completed' ? TOTAL_CYCLES : currentCycleLabel} of {TOTAL_CYCLES}
            </p>

            <div aria-live="polite" aria-atomic="true">
              {feedback ? (
                <p className="max-w-sm text-sm font-semibold leading-snug text-white/90 sm:text-base">
                  {feedback}
                </p>
              ) : (
                <p className="max-w-sm text-xs font-medium leading-snug text-white/65 sm:text-sm">
                  Trace the ring with your finger or mouse until it fills.
                </p>
              )}
            </div>
          </div>

          {exerciseStatus === 'completed' && (
            <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:gap-3">
              <Link
                href="/choose"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-center font-sans text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-white/18 sm:px-5 sm:py-3.5 sm:text-base"
              >
                COMPLETE
              </Link>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#00FFD1]/45 bg-[#00FFD1]/12 px-4 py-3 font-sans text-sm font-extrabold uppercase tracking-wide text-[#00FFD1] transition-colors hover:bg-[#00FFD1]/22 sm:px-5 sm:py-3.5 sm:text-base"
                onClick={resetExercise}
              >
                STAY
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </main>
  );
}
