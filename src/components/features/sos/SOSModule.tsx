'use client';

import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';
import { useBlunnoStore, type BreathPhase } from '@/store/blunnoStore';
import { BlunnoBlob } from '@/components/shared/BlunnoBlob';
import { Button, Card } from '@/components/ui';

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
    abortRef.current = true;
    setIsRunning(false);
    setBreathPhase('none');
    setActivePhase('none');
    setBlunnoState('panic');
    setRound(1);
    setSecondsLeft(PHASES[0].seconds);

    window.setTimeout(() => {
      void run();
    }, 2500);
  };

  useEffect(() => {
    void run();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-8 pt-6">
      <div className="flex flex-col items-center gap-6">
        <BlunnoBlob />

        <Card variant="glass" padding="md" className="w-full border-white/20 shadow-screen">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-figma text-white/75">SOS</div>
              <div className="mt-1 font-sans text-xl font-extrabold text-white">
                Breathing 4-7-8
              </div>
              <div className="mt-2 text-sm text-white/60">
                Round {round} of {rounds}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-white/70">
                {activePhase === 'none'
                  ? 'Ready'
                  : PHASES.find((p) => p.phase === activePhase)?.label}
              </div>
              <div className="mt-1 text-3xl font-bold leading-none text-white">{secondsLeft}</div>
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
                        ? 'border-blunno-blue/50 bg-blunno-blue/15 text-white'
                        : 'border-white/10 bg-white/5 text-white/60',
                    ].join(' ')}
                  >
                    <div className="text-xs uppercase tracking-wide opacity-90">{idx + 1}</div>
                    <div className="mt-0.5 text-[10px] leading-tight sm:text-sm">
                      <span className="sm:hidden">{p.mobileLabel}</span>
                      <span className="hidden sm:inline">{p.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              type="button"
              variant="danger"
              size="md"
              className="flex-1 rounded-2xl py-3"
              onClick={panicNow}
            >
              I&apos;M SCARED
            </Button>

            {isRunning ? (
              <Button
                type="button"
                variant="ghost"
                size="md"
                className="flex-1 rounded-2xl border-white/20 py-3"
                onClick={stop}
              >
                Stop
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                className="flex-1 rounded-2xl py-3"
                onClick={() => {
                  void run();
                }}
              >
                Start
              </Button>
            )}
          </div>

          <p className="mt-4 text-xs text-white/45">
            Pauses and repeats run automatically. You can stop anytime.
          </p>
        </Card>
      </div>
    </div>
  );
};
