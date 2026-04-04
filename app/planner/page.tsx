import { TopNav } from '@/components/shared/TopNav';
import { Card } from '@/components/ui';

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-blunno-bg text-blunno-foreground">
      <TopNav title="Planner" />

      <div className="mx-auto w-full max-w-md px-4 py-8">
        <Card variant="glass" padding="lg" className="border-white/20 shadow-screen">
          <div className="text-xs font-semibold uppercase tracking-figma text-white/70">
            Coming soon
          </div>
          <div className="mt-2 font-sans text-2xl font-extrabold text-white">Planner</div>
          <p className="mt-3 text-sm text-white/60">
            Next up: drag &amp; drop and saving to IndexedDB.
          </p>
        </Card>
      </div>
    </main>
  );
}
