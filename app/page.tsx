'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Howl } from 'howler';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { BlunnoBlob } from '@/components/shared/BlunnoBlob';

// Sound init (if files are missing, it will stay silent)
let bubblePop: Howl | null = null;
let hoverSound: Howl | null = null;

if (typeof window !== 'undefined') {
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
}

export default function WelcomePage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverSound?.play();
  };

  const handleBlobClick = () => {
    bubblePop?.play();
    router.push('/choose');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d081b] overflow-hidden relative">
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
            opacity: isHovered ? 0.8 : 0.4,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-purple-500/30 blur-[80px] rounded-full"
        />

        <div className="relative z-20">
          <BlunnoBlob />
        </div>
      </motion.div>

      {/* Dynamic slogan */}
      <div className="mt-12 h-20 flex flex-col items-center justify-start text-center z-10 max-w-[92vw]">
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div
              key="slogan"
              initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
              transition={{ duration: 0.6 }}
              className="text-center px-3 w-full max-w-[340px]"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] break-words">
                No stress, no mess
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-sm uppercase tracking-[0.16em] sm:tracking-[0.3em] font-light text-purple-200/40"
              >
                just{' '}
                <span className="text-cyan-300/70 font-semibold drop-shadow-[0_0_8px_rgba(103,232,249,0.4)]">
                  Blunno
                </span>{' '}
                best
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="group"
            >
              <p className="text-white/80 text-lg md:text-xl font-medium tracking-wide">
                Ready for a{' '}
                <span className="text-purple-400 border-b-2 border-purple-400/30">
                  fresh start?
                </span>
              </p>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-3 text-cyan-300/50"
              >
                Tap Blunno to choose a mode
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
