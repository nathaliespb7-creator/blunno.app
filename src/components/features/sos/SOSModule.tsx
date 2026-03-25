'use client';

import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';
import { useBlunnoStore, type BreathPhase } from '@/store/blunnoStore';
import { BlunnoBlob } from '@/components/shared/BlunnoBlob';

type PhaseDef = {
  phase: Exclude<BreathPhase, 'none'>;
  label: string;
  mobileLabel: string;
  seconds: number;
};

const PHASES: PhaseDef[] = [
  { phase: 'inhale', label: 'Inhale', mobileLabel: 'In', seconds: 4 },
  { phase: 'hold', label: 'Hold', mobileLabel: 'Hold', seconds: 7 },
  { phase: 'exhale', label: 'Exhale', mobileLabel: 'Out', seconds: 8 },
];

let inhaleSound: Howl | null = null;
if (typeof window !== 'undefined') {
  inhaleSound = new Howl({
    src: ['/sounds/inhale.mp3'],
    volume: 0.12,
    onloaderror: () => {
      // Optional sound file may be absent.
    },
  });
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const SOSModule = () => {
  const { setBlunnoState, setBreathPhase } = useBlunnoStore();

  const abortRef = useRef(false);

  const [isRunning, setIsRunning] = useState(true);
  const [activePhase, setActivePhase] = useState<BreathPhase>('none');
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASES[0].seconds);
  const [round, setRound] = useState<number>(1);

  const rounds = 4;

  const runPhase = async (phase: PhaseDef) => {
    if (abortRef.current) return;
    setActivePhase(phase.phase);
    setBreathPhase(phase.phase);
    if (phase.phase === 'inhale') inhaleSound?.play();

    for (let t = phase.seconds; t > 0; t -= 1) {
      if (abortRef.current) return;
      setSecondsLeft(t);
      await delay(1000);
    }
  };

  const run = async () => {
    abortRef.current = false;
    setIsRunning(true);
    setRound(1);
    setSecondsLeft(PHASES[0].seconds);
    setBlunnoState('breathing');
    setBreathPhase(PHASES[0].phase);
    setActivePhase(PHASES[0].phase);

    for (let r = 1; r <= rounds; r += 1) {
      if (abortRef.current) break;
      setRound(r);

      for (const p of PHASES) {
        await runPhase(p);
        if (abortRef.current) break;
      }
    }

    if (!abortRef.current) {
      setBreathPhase('none');
      setActivePhase('none');
      setBlunnoState('idle');
    }

    setIsRunning(false);
  };

  const stop = () => {
    abortRef.current = true;
    setIsRunning(false);
    setBreathPhase('none');
    setActivePhase('none');
    setBlunnoState('idle');
    setRound(1);
    setSecondsLeft(PHASES[0].seconds);
  };

  const panicNow = () => {
    // Важно: пока breathPhase != 'none', BlunnoBlob показывает только scale (без panic x/rotate),
    // поэтому при панике сбрасываем дыхание.
    abortRef.current = true;
    setIsRunning(false);
    setBreathPhase('none');
    setActivePhase('none');
    setBlunnoState('panic');
    setRound(1);
    setSecondsLeft(PHASES[0].seconds);

    // Вернёмся к дыханию через короткую паузу
    window.setTimeout(() => {
      void run();
    }, 2500);
  };

  useEffect(() => {
    // Автозапуск при открытии страницы /sos
    void run();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="flex flex-col items-center gap-6">
        <BlunnoBlob />

        <div className="w-full overflow-hidden rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md p-4 sm:p-5 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-white/80 text-xs tracking-widest uppercase">SOS</div>
              <div className="text-white text-xl font-semibold mt-1">Breathing 4-7-8</div>
              <div className="text-white/60 text-sm mt-2">
                Round {round} of {rounds}
              </div>
            </div>

            <div className="text-right">
              <div className="text-white/70 text-sm">
                {activePhase === 'none'
                  ? 'Ready'
                  : PHASES.find((p) => p.phase === activePhase)?.label}
              </div>
              <div className="text-white text-3xl font-bold leading-none mt-1">{secondsLeft}</div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {PHASES.map((p, idx) => {
                const isActive = activePhase === p.phase;
                return (
                  <div
                    key={p.phase}
                    className={[
                      'min-w-0 rounded-2xl border px-1.5 py-2 text-center transition-colors',
                      isActive
                        ? 'border-white/25 bg-white/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/60',
                    ].join(' ')}
                  >
                    <div className="text-xs uppercase tracking-wide opacity-90">{idx + 1}</div>
                    <div className="text-[10px] sm:text-sm mt-0.5 leading-tight">
                      <span className="sm:hidden">{p.mobileLabel}</span>
                      <span className="hidden sm:inline">{p.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={panicNow}
              className="flex-1 rounded-2xl border border-red-400/30 bg-red-500/10 text-red-100 py-3 font-medium hover:border-red-400/60 transition-colors"
            >
              I'M SCARED
            </button>

            {isRunning ? (
              <button
                onClick={stop}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 text-white/90 py-3 font-medium hover:border-white/25 transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => {
                  void run();
                }}
                className="flex-1 rounded-2xl border border-blue-400/30 bg-blue-500/10 text-blue-100 py-3 font-medium hover:border-blue-400/60 transition-colors"
              >
                Start
              </button>
            )}
          </div>

          <p className="text-white/40 text-xs mt-4">
            Pauses and repeats run automatically. You can stop anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

