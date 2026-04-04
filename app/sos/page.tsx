import Link from 'next/link';

import { SOSModule } from '@/components/features/sos/SOSModule';

const safeTop = { paddingTop: 'max(36px, calc(env(safe-area-inset-top) + 28px))' } as const;

export default function SosPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-blunno-bg text-blunno-foreground">
      <div className="mx-auto flex w-full max-w-md justify-end px-4 pb-3" style={safeTop}>
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
      <p className="mx-auto max-w-md px-5 pb-2 font-sans text-[22px] font-extrabold uppercase tracking-figma [text-shadow:var(--shadow-text-title)]">
        BREATHE WITH BLUNNO
      </p>
      <SOSModule />
    </main>
  );
}
