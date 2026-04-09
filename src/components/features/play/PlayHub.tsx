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
    <main className="min-h-screen overflow-x-hidden bg-[#0D0524] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-white">
      <div className="mx-auto w-full max-w-[390px] rounded-[25px] border border-black/40 bg-[#0D0524] shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
        {selectedGame === null ? (
          <section className="relative min-h-[853px] px-5 pb-10 pt-9">
            <div className="flex justify-end">
              <Link
                href="/choose"
                aria-label="Back home"
                className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/25"
              >
                <Image src="/images/play/spinner-preview.png" alt="Home" fill className="object-cover" />
              </Link>
            </div>

            <h1 className="mt-16 w-full shrink-0 py-2 text-center font-sans text-lg font-extrabold uppercase leading-tight tracking-figma [text-shadow:var(--shadow-text-title)] sm:text-xl md:text-[22px]">
              <span className="text-white">PLAY WITH </span>
              <span className="text-[#00FFD1]">BLUNNO</span>
            </h1>

            <button
              type="button"
              onClick={() => {
                void openGame('snake');
              }}
              className="mt-12 flex w-full justify-center"
              aria-label="Open Snake game"
            >
              <div className="grid grid-cols-9 gap-0.5 rounded-sm p-1">
                {Array.from({ length: 27 }).map((_, i) => {
                  const x = i % 9;
                  const y = Math.floor(i / 9);
                  const on = snakePixels.some(([sx, sy]) => sx === x && sy === y);
                  const isFood = x === 7 && y === 1;
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={[
                        'h-4 w-4 sm:h-5 sm:w-5',
                        on ? 'bg-[#E8F346]' : 'bg-transparent',
                        isFood ? '!bg-red-600' : '',
                      ].join(' ')}
                    />
                  );
                })}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                void openGame('snipper');
              }}
              className="mx-auto mt-16 block"
              aria-label="Open Spinner game"
            >
              <Image
                src="/images/play/snake-preview.png"
                alt="Spinner"
                width={230}
                height={180}
                className="h-auto w-[230px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                void openGame('balloon');
              }}
              className="mx-auto mt-16 block"
              aria-label="Open Balloon Pop game"
            >
              <Image
                src="/images/play/balloon-popit.png"
                alt="Balloon Pop visual"
                width={320}
                height={205}
                className="h-auto w-[250px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
              />
            </button>
          </section>
        ) : (
          <section className="min-h-[853px] p-4">
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
