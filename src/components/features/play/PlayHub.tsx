'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactElement } from 'react';

import { BalloonPop } from '@/components/features/play/BalloonPop';
import { SnakeGame } from '@/components/features/play/SnakeGame';
import { SnipperGame } from '@/components/features/play/SnipperGame';
import { audioService } from '@/services/audioService';

type GameKey = 'snake' | 'snipper' | 'balloon';

export function PlayHub(): ReactElement {
  const [selectedGame, setSelectedGame] = useState<GameKey | null>(null);

  const openGame = async (game: GameKey): Promise<void> => {
    await audioService.ensureUnlocked();
    await audioService.play('pop');
    setSelectedGame(game);
  };

  const backToGames = () => {
    setSelectedGame(null);
  };

  const snakePixels = [
    [0, 0],
    [1, 0],
    [3, 0],
    [4, 0],
    [5, 0],
    [6, 0],
    [0, 1],
    [3, 1],
    [6, 1],
    [1, 2],
    [2, 2],
    [3, 2],
  ] as const;

  return (
    <main className="relative flex h-dvh max-h-dvh min-h-0 w-full flex-col items-center justify-center overflow-hidden overscroll-none bg-blunno-bg px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-white">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col rounded-[25px] border border-black/40 bg-blunno-bg shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
        {selectedGame === null ? (
          <section className="w-full px-5 pb-6 pt-4 sm:px-8">
            <div className="flex w-full shrink-0 justify-end">
              <Link
                href="/choose"
                aria-label="Exit to mode selection"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#1a1a2e]/90 text-white/95 shadow-md backdrop-blur-sm"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </Link>
            </div>

            <div className="mt-8 grid w-full grid-cols-1 justify-items-center gap-6 sm:mt-12 sm:grid-cols-3 sm:gap-8">
              <button
                type="button"
                onClick={() => {
                  void openGame('snake');
                }}
                className="flex flex-col items-center"
                aria-label="Open Snake game"
              >
                <div className="flex h-[140px] w-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:w-[250px]">
                  <div className="mx-auto grid grid-cols-8 gap-0.5 rounded-sm p-1">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const x = i % 8;
                      const y = Math.floor(i / 8);
                      const on = snakePixels.some(([sx, sy]) => sx === x && sy === y);
                      const isFood = x === 7 && y === 1;
                      return (
                        <div
                          key={`${x}-${y}`}
                          className={[
                            'h-3.5 w-3.5 sm:h-4 sm:w-4',
                            on ? 'bg-[#E8F346]' : 'bg-transparent',
                            isFood ? '!bg-red-600' : '',
                          ].join(' ')}
                        />
                      );
                    })}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  void openGame('snipper');
                }}
                className="flex flex-col items-center"
                aria-label="Open Spinner game"
              >
                <div className="flex h-[140px] w-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:w-[250px]">
                  <Image
                    src="/images/play/snake-preview.png"
                    alt="Spinner"
                    width={230}
                    height={180}
                    className="mx-auto h-auto w-[145px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)] sm:w-[165px]"
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  void openGame('balloon');
                }}
                className="flex flex-col items-center"
                aria-label="Open Balloon Pop game"
              >
                <div className="flex h-[140px] w-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:w-[250px]">
                  <Image
                    src="/images/play/balloon-popit.png"
                    alt="Balloon Pop visual"
                    width={320}
                    height={205}
                    className="h-auto w-[160px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] sm:w-[180px]"
                  />
                </div>
              </button>
            </div>
          </section>
        ) : (
          <section className="min-h-0 flex-1 p-4 pb-20">
            <button
              type="button"
              onClick={backToGames}
              className="mb-4 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/15"
            >
              ← Back to games
            </button>
            {selectedGame === 'snake' && <SnakeGame />}
            {selectedGame === 'snipper' && <SnipperGame />}
            {selectedGame === 'balloon' && <BalloonPop />}
          </section>
        )}
      </div>
    </main>
  );
}
