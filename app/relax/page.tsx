import { TopNav } from '@/components/shared/TopNav';
import { Card } from '@/components/ui';

export default function RelaxPage() {
  return (
    <main className="min-h-screen bg-blunno-bg text-blunno-foreground">
      <TopNav title="Relax" />

      <div className="mx-auto w-full max-w-md px-4 py-8">
        <Card variant="glass" padding="lg" className="border-white/20 shadow-screen">
          <p className="font-sans text-[22px] font-extrabold uppercase tracking-figma [text-shadow:var(--shadow-text-title)]">
            RELAX WITH BLUNNO
          </p>
          <p className="mt-4 text-sm text-white/65">
            Quiet space for a slower pace — more exercises will land here soon.
          </p>
        </Card>
      </div>
    </main>
  );
}
