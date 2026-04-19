'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactElement } from 'react';

import { BalloonPop } from '@/components/features/play/BalloonPop';
import { BlunnoTetris } from '@/components/features/play/BlunnoTetris';
import { SpinnerGame } from '@/components/features/play/SpinnerGame';
import { cn } from '@/lib/utils';
import { audioService } from '@/services/audioService';

type GameKey = 'tetris' | 'spinner' | 'balloon';

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

  const tetrisPixels = [
    [1, 0, '#38BDF8'],
    [2, 0, '#38BDF8'],
    [3, 0, '#38BDF8'],
    [4, 0, '#38BDF8'],
    [2, 1, '#E879F9'],
    [1, 2, '#E879F9'],
    [2, 2, '#E879F9'],
    [3, 2, '#E879F9'],
    [4, 2, '#FDE047'],
    [5, 2, '#FDE047'],
    [4, 3, '#FDE047'],
    [5, 3, '#FDE047'],
    [0, 4, '#A3E635'],
    [1, 4, '#A3E635'],
    [1, 5, '#A3E635'],
    [2, 5, '#A3E635'],
  ] as const;

  return (
    <main
      className={cn(
        'flex h-dvh min-h-dvh max-h-dvh flex-col overflow-x-hidden',
        selectedGame === null ? 'overflow-y-auto overscroll-y-contain' : 'overflow-y-hidden',
        'bg-blunno-bg text-blunno-foreground',
        selectedGame === null ? 'px-4 py-4 sm:px-5 sm:py-6' : 'px-3 py-2 sm:px-5 sm:py-4',
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
        {selectedGame === null ? (
          <>
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

            <h1
              className={cn(
                'w-full shrink-0 py-2 text-center font-sans text-lg font-extrabold uppercase leading-tight tracking-figma [text-shadow:var(--shadow-text-title)]',
                'sm:text-xl md:text-[22px]',
                '[@media(max-height:620px)]:py-1 [@media(max-height:620px)]:text-base'
              )}
            >
              <span className="text-white">PLAY WITH </span>
              <span className="text-[#00FFD1]">BLUNNO</span>
            </h1>

            <div
              className={cn(
                'flex min-h-0 w-full flex-1 flex-col items-center justify-center py-1 [@media(max-height:620px)]:py-0'
              )}
            >
              <div className="grid w-full max-w-5xl grid-cols-1 justify-items-center gap-6 sm:grid-cols-3 sm:gap-8">
              <button
                type="button"
                onClick={() => {
                  void openGame('tetris');
                }}
                className="flex flex-col items-center"
                aria-label="Open Tetris game"
              >
                <div className="flex h-[140px] w-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:w-[250px]">
                  <div className="mx-auto grid grid-cols-6 gap-0.5 rounded-sm p-1">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const x = i % 6;
                      const y = Math.floor(i / 6);
                      const active = tetrisPixels.find(([px, py]) => px === x && py === y);
                      return (
                        <div
                          key={`${x}-${y}`}
                          className={[
                            'h-3.5 w-3.5 sm:h-4 sm:w-4',
                            active ? '' : 'bg-transparent',
                          ].join(' ')}
                          style={active ? { backgroundColor: active[2] } : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  void openGame('spinner');
                }}
                className="flex flex-col items-center"
                aria-label="Open fidget spinner game"
              >
                <div className="flex h-[140px] w-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:w-[250px]">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-[100px] w-[100px] drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)] sm:h-[108px] sm:w-[108px]"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="spinnerPreviewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#5EEAD4" />
                        <stop offset="50%" stopColor="#A78BFA" />
                        <stop offset="100%" stopColor="#F0ABFC" />
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="22" r="18" fill="url(#spinnerPreviewGrad)" opacity="0.92" />
                    <circle cx="22" cy="88" r="18" fill="url(#spinnerPreviewGrad)" opacity="0.92" />
                    <circle cx="98" cy="88" r="18" fill="url(#spinnerPreviewGrad)" opacity="0.92" />
                    <circle cx="60" cy="60" r="22" fill="#1a1a2e" stroke="white" strokeOpacity="0.35" strokeWidth="2" />
                    <circle cx="60" cy="60" r="10" fill="#00FFD1" opacity="0.95" />
                  </svg>
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
            </div>
          </>
        ) : (
          <section className="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-hidden p-1.5 sm:p-3">
            <div className="flex w-full shrink-0 items-center justify-between gap-2">
              <button
                type="button"
                onClick={backToGames}
                className="w-fit rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/15 sm:text-sm"
              >
                ← Back to games
              </button>
              <Link
                href="/choose"
                aria-label="Exit to mode selection"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#1a1a2e]/90 text-white/95 shadow-md backdrop-blur-sm"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </Link>
            </div>
            <div className="flex min-h-0 flex-1 w-full flex-col overflow-hidden">
              {selectedGame === 'tetris' && <BlunnoTetris />}
              {selectedGame === 'spinner' && <SpinnerGame />}
              {selectedGame === 'balloon' && <BalloonPop />}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
