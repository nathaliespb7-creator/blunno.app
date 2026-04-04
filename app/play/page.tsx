import { TopNav } from '@/components/shared/TopNav';
import { Card } from '@/components/ui';

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-blunno-bg text-blunno-foreground">
      <TopNav title="Play" />

      <div className="mx-auto w-full max-w-md px-4 py-8">
        <p className="mb-6 font-sans text-[22px] font-extrabold uppercase tracking-figma [text-shadow:var(--shadow-text-title)]">
          PLAY WITH BLUNNO
        </p>
        <Card variant="glass" padding="lg" className="border-white/20 shadow-screen">
          <div className="text-xs font-semibold uppercase tracking-figma text-white/70">
            Coming soon
          </div>
          <div className="mt-2 font-sans text-2xl font-extrabold text-white">Games</div>
          <p className="mt-3 text-sm text-white/60">Next: Snake and Balloon Pop.</p>
        </Card>
      </div>
    </main>
  );
}
