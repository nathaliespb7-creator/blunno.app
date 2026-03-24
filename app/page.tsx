'use client';

import { BlunnoBlob } from '@/components/shared/BlunnoBlob';
import { audioService } from '@/services/audioService';
import { useBlunnoStore } from '@/store/blunnoStore';

export default function Home() {
  const { triggerBreathing, triggerSOS, triggerSuccess } = useBlunnoStore();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-purple-900 to-black">
      <BlunnoBlob />
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => {
            audioService.unlock();
            triggerBreathing();
          }}
          className="glass-button px-4 py-2 rounded text-white"
        >
          Breathing
        </button>
        <button
          onClick={() => {
            audioService.unlock();
            triggerSOS();
          }}
          className="glass-button px-4 py-2 rounded text-white"
        >
          SOS
        </button>
        <button
          onClick={() => {
            audioService.unlock();
            triggerSuccess();
          }}
          className="glass-button px-4 py-2 rounded text-white"
        >
          Success
        </button>
      </div>
    </main>
  );
}
