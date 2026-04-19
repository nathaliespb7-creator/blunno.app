'use client';

import { useCallback, useRef, useState, type ReactElement } from 'react';

function angleFromPointer(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
}

/**
 * Спиннер для фокуса: большой цветной круг + перетаскивание (мышь и тач).
 * Реализация своя — библиотека react-fidget-spinner давала нулевой размер дочернего слоя и «пропадал» круг.
 */
export function SpinnerGame(): ReactElement {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [lastAngle, setLastAngle] = useState<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    setLastAngle(angleFromPointer(e.clientX, e.clientY, rect));
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (lastAngle === null || !wheelRef.current) return;
      const rect = wheelRef.current.getBoundingClientRect();
      const current = angleFromPointer(e.clientX, e.clientY, rect);
      let delta = current - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      setRotation((r) => r + delta);
      setLastAngle(current);
    },
    [lastAngle]
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setLastAngle(null);
  }, []);

  const size = 'min(80vw, min(52dvh, 300px))';

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-col overflow-hidden bg-[#0D0524] px-2 py-1 [@media(min-height:640px)]:py-3">
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm [@media(min-height:640px)]:p-6">
        <h2 className="mb-1 text-center font-sans text-sm font-extrabold uppercase tracking-wide text-white/95 [@media(min-height:640px)]:mb-3 [@media(min-height:640px)]:text-base sm:text-lg">
          Fidget spinner
        </h2>
        <p className="mb-2 text-center text-xs text-white/70 [@media(min-height:640px)]:mb-4 [@media(min-height:640px)]:text-sm">
          Drag to spin — mouse or touch.
        </p>
        <div
          className="flex shrink-0 touch-none items-center justify-center select-none"
          style={{ width: size, height: size }}
        >
          <div
            ref={wheelRef}
            role="application"
            aria-label="Fidget spinner: drag around the wheel to rotate"
            className="relative flex h-full w-full cursor-grab items-center justify-center overflow-hidden rounded-full border-2 border-white/20 shadow-[inset_0_2px_16px_rgba(0,0,0,0.35)] active:cursor-grabbing"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(110,218,228,0.5) 0%, rgba(167,139,250,0.55) 42%, rgba(44,25,72,0.98) 100%)',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              className="absolute inset-[10%] rounded-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                background:
                  'conic-gradient(from 0deg, #5EEAD4 0deg 90deg, #A78BFA 90deg 180deg, #F0ABFC 180deg 270deg, #67E8F9 270deg 360deg)',
              }}
            />
            <div className="relative z-10 flex h-[32%] w-[32%] items-center justify-center rounded-full bg-[#1a1a2e] shadow-lg ring-2 ring-[#00FFD1]/50">
              <div className="h-[45%] w-[45%] rounded-full bg-[#00FFD1] opacity-95 shadow-inner" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
