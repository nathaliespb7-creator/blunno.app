'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';

import { cn } from '@/lib/utils';

type MoodId = 'sos' | 'planner' | 'play' | 'relax';

type MoodTile = {
  id: MoodId;
  label: string;
  href: string;
  /** Figma: точные градиенты */
  gradient: string;
};

const MOOD_TILES: readonly MoodTile[] = [
  {
    id: 'sos',
    label: 'SOS',
    href: '/sos',
    gradient: 'linear-gradient(135deg, #2A1C29 0%, #905E8C 100%)',
  },
  {
    id: 'planner',
    label: 'PLANNER',
    href: '/planner',
    gradient: 'linear-gradient(135deg, #364547 0%, #83A9AD 100%)',
  },
  {
    id: 'play',
    label: 'PLAY',
    href: '/play',
    gradient: 'linear-gradient(135deg, #2C1948 0%, #6A3CAE 100%)',
  },
  {
    id: 'relax',
    label: 'RELAX',
    href: '/relax',
    gradient: 'linear-gradient(135deg, #81642F 0%, #E7B453 100%)',
  },
] as const;

/** На обычных экранах без прокрутки; на очень низких вьюпорт — компактнее, при необходимости лёгкий скролл у main */
const tileClass = cn(
  'group relative flex w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-white',
  'mx-auto px-4 py-4 text-center font-sans text-base font-extrabold uppercase tracking-wide text-white shadow-lg',
  'min-h-[64px] sm:min-h-[88px] md:min-h-[120px] md:max-w-md',
  '[@media(max-height:620px)]:min-h-[52px] [@media(max-height:620px)]:py-3 [@media(max-height:620px)]:text-sm',
  'transition-transform duration-200 [box-shadow:inset_0_4px_50px_rgba(0,0,0,0.2)] will-change-transform',
  'hover:scale-105 hover:brightness-105 active:scale-[0.98]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
);

export default function ChoosePage(): ReactElement {
  return (
    <main
      className={cn(
        'flex min-h-dvh max-h-dvh flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain bg-blunno-bg text-blunno-foreground',
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
            href="/"
            aria-label="Exit to welcome screen"
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
            'w-full shrink-0 py-2 text-center font-sans text-lg font-extrabold uppercase leading-tight tracking-figma text-white [text-shadow:var(--shadow-text-title)]',
            'sm:text-xl md:text-[22px]',
            '[@media(max-height:620px)]:py-1 [@media(max-height:620px)]:text-base'
          )}
        >
          CHOOSE YOUR MOOD
        </h1>

        <nav
          className="flex min-h-0 w-full flex-1 flex-col items-stretch justify-center py-1 [@media(max-height:620px)]:py-0"
          aria-label="Choose your mood"
        >
          <div
            className={cn(
              'grid min-h-0 w-full grid-cols-1 gap-3 p-0.5 sm:gap-4',
              '[@media(max-height:620px)]:gap-2',
              'md:grid-cols-2 md:gap-4 lg:gap-5'
            )}
          >
            {MOOD_TILES.map((tile) => (
              <Link
                key={tile.id}
                href={tile.href}
                className={tileClass}
                style={{ backgroundImage: tile.gradient }}
              >
                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">{tile.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
