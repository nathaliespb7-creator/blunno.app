'use client';

import { motion } from 'framer-motion';
import type { Howl } from 'howler';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { BlunnoBlob } from '@/components/shared/BlunnoBlob';

// Lazy-init Howler on first interaction (lighter first paint on slow devices)
let bubblePop: Howl | null = null;
let hoverSound: Howl | null = null;
let soundsReady: Promise<void> | null = null;

async function ensureSounds() {
  if (typeof window === 'undefined') return;
  if (soundsReady) return soundsReady;
  soundsReady = (async () => {
    const { Howl } = await import('howler');
    bubblePop = new Howl({
      src: ['/sounds/pop.mp3'],
      volume: 0.4,
      preload: false,
      onloaderror: () => {
        // Missing optional file is acceptable.
      },
    });
    hoverSound = new Howl({
      src: ['/sounds/hover-soft.mp3'],
      volume: 0.15,
      rate: 1.2,
      onloaderror: () => {
        // Missing optional file is acceptable.
      },
    });
  })();
  return soundsReady;
}

export default function WelcomePage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    void ensureSounds().then(() => hoverSound?.play());
  };

  const handleBlobClick = () => {
    router.push('/choose');
    void ensureSounds().then(() => {
      bubblePop?.play();
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blunno-bg overflow-hidden relative">
      {/* Grain effect */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%2780%27 height=%2780%27 filter=%27url(%23n)%27 opacity=%270.45%27/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Blunno container */}
      <motion.div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleBlobClick}
        onKeyDown={(e) => e.key === 'Enter' && handleBlobClick()}
        role="button"
        tabIndex={0}
        aria-label="Go to mode selection"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative cursor-pointer z-10 outline-none"
      >
        {/* Background glow */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.75 : 0.38,
            scale: isHovered ? 1.15 : 1,
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(110,218,228,0.35),rgba(139,92,246,0.2),transparent_70%)] blur-[72px]"
        />

        <div className="relative z-20">
          <BlunnoBlob />
        </div>
      </motion.div>

      {/* Slogan */}
      <div className="mt-12 h-20 flex flex-col items-center justify-start text-center z-10 max-w-[92vw]">
        <motion.div
          initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6 }}
          className="text-center px-3 w-full max-w-[340px]"
        >
          <h2 className="break-words font-sans text-[clamp(1.5rem,5vw,2.375rem)] font-extrabold leading-tight tracking-[0.01em] text-white/92 [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">
            No stress, no mess
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 font-sans text-[22px] font-extrabold uppercase leading-[3.18] tracking-figma"
          >
            <span className="text-white/38 [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">JUST </span>
            <span className="text-blunno-cyan drop-shadow-[0_0_12px_rgba(110,218,228,0.45)] [text-shadow:0_4px_0_rgba(0,0,0,0.25)]">
              BLUNNO
            </span>
            <span className="text-white/38 [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]"> BEST</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
