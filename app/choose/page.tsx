import Link from 'next/link';

import { cn } from '@/lib/utils';

const safeTop = { paddingTop: 'max(36px, calc(env(safe-area-inset-top) + 28px))' } as const;

const modeTileClass = (variant: 'sos' | 'planner' | 'play' | 'relax') =>
  cn(
    'group relative flex min-h-[80px] w-full max-w-[350px] items-center justify-center overflow-hidden rounded-card border border-white px-6 text-center font-sans text-xl font-extrabold uppercase tracking-figma shadow-screen transition-transform active:scale-[0.99] [box-shadow:inset_0_4px_50px_rgba(0,0,0,0.25)]',
    variant === 'sos' && 'bg-blunno-sos text-white',
    variant === 'planner' &&
      'bg-blunno-planner text-white [box-shadow:inset_0_4px_200px_rgba(0,0,0,0.25)]',
    variant === 'play' && 'bg-blunno-play text-white',
    variant === 'relax' && 'bg-blunno-relax text-[#fffbfb]'
  );

export default function ChoosePage() {
  return (
    <main
      className="min-h-screen bg-blunno-bg px-5 pb-12 text-blunno-foreground"
      style={safeTop}
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="flex w-full justify-end">
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

        <h1 className="mt-10 text-center font-sans text-[22px] font-extrabold uppercase leading-[3.18] tracking-figma text-white [text-shadow:var(--shadow-text-title)]">
          CHOOSE YOUR MODE
        </h1>

        <nav
          className="mt-14 flex w-full flex-col items-center gap-11"
          aria-label="App modes"
        >
          <Link href="/sos" className={modeTileClass('sos')}>
            SOS
          </Link>
          <Link href="/planner" className={modeTileClass('planner')}>
            PLANNER
          </Link>
          <Link href="/play" className={modeTileClass('play')}>
            PLAY
          </Link>
          <Link href="/relax" className={modeTileClass('relax')}>
            RELAX
          </Link>
        </nav>
      </div>
    </main>
  );
}
