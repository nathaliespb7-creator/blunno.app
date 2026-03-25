import { TopNav } from '@/components/shared/TopNav';

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1040] to-[#0d0820] text-white">
      <TopNav title="Planner" />

      <div className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md p-5 shadow-lg">
          <div className="text-white/80 text-xs tracking-widest uppercase">Coming soon</div>
          <div className="mt-2 text-white text-xl font-semibold">Planner</div>
          <p className="mt-2 text-white/60 text-sm">
            Next up: drag &amp; drop and saving to IndexedDB.
          </p>
        </div>
      </div>
    </main>
  );
}

