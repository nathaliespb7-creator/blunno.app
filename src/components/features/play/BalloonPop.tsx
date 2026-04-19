'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';

import { audioService } from '@/services/audioService';

type Balloon = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
};

const COLORS = ['#6EDAE4', '#8B5CF6', '#E7B453', '#EC4899', '#34D399'];
const GAME_SECONDS = 30;

export function BalloonPop(): ReactElement {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const spawn = window.setInterval(() => {
      setBalloons((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 88,
          y: 100,
          size: 42 + Math.random() * 26,
          speed: 0.45 + Math.random() * 0.65,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        },
      ]);
    }, 850);
    return () => window.clearInterval(spawn);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y + b.size / 100 > -12)
      );
    }, 16);
    return () => window.clearInterval(tick);
  }, [running]);

  const popBalloon = (id: number) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
    void audioService.play('pop');
  };

  const restart = () => {
    setBalloons([]);
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setRunning(true);
  };

  const status = useMemo(() => (running ? 'Pop as many as you can!' : 'Time is up!'), [running]);

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col">
      <div className="mb-2 flex shrink-0 items-center justify-between text-sm font-semibold text-white/85">
        <span>Score: {score}</span>
        <span>Time: {timeLeft}s</span>
      </div>
      <div className="relative min-h-[min(42dvh,20rem)] flex-1 overflow-hidden rounded-xl border border-white/20 bg-black/25">
        {balloons.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => popBalloon(b.id)}
            className="absolute rounded-full border border-white/30 shadow-lg transition-transform hover:scale-105"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              background: `radial-gradient(circle at 30% 30%, #ffffff99, ${b.color})`,
            }}
            aria-label="Pop balloon"
          />
        ))}
      </div>
      <p className="mt-2 shrink-0 text-center text-sm text-white/70">{status}</p>
      {!running && (
        <div className="mt-2 flex shrink-0 justify-center">
          <button
            type="button"
            onClick={restart}
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
