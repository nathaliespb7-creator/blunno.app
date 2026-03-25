import { SOSModule } from '@/components/features/sos/SOSModule';
import { TopNav } from '@/components/shared/TopNav';

export default function SosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1040] to-[#0d0820] text-white overflow-x-hidden">
      <TopNav title="SOS" />
      <SOSModule />
    </main>
  );
}

