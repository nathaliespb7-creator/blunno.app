'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import { useBlunnoStore, type BlunnoState, type BreathPhase } from '@/store/blunnoStore';
import { BLUNNO_MASCOT_PNG } from '@/lib/assets';

export const BlunnoBlob = () => {
  const { currentState, breathPhase } = useBlunnoStore();

  // Анимации для общих состояний
  const stateVariants: Record<BlunnoState, TargetAndTransition> = {
    idle: {
      scale: [1, 1.03, 1],
      y: [0, -5, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    breathing: {
      scale: 1,
      transition: { duration: 0.2 },
    },
    success: {
      y: [0, -30, 0],
      scaleX: [1, 0.8, 1.1, 1],
      scaleY: [1, 1.2, 0.9, 1],
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    panic: {
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.1, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  // Анимации для дыхания (перекрывают scale)
  const breathVariants: Record<BreathPhase, TargetAndTransition> = {
    inhale: { scale: 1.25, transition: { duration: 4, ease: 'easeInOut' } },
    hold: { scale: 1.25, transition: { duration: 0.1 } },
    exhale: { scale: 1, transition: { duration: 8, ease: 'easeInOut' } },
    none: { scale: 1 },
  };

  const currentMotion: TargetAndTransition =
    breathPhase !== 'none' ? breathVariants[breathPhase] : stateVariants[currentState];

  return (
    <div className="relative flex items-center justify-center p-8 select-none">
      {/* Рассеянное свечение сзади (glass/glow) */}
      <motion.div
        className="pointer-events-none absolute rounded-full blur-3xl"
        animate={{ opacity: [0.45, 0.78, 0.45], scale: [1, 1.06, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 280,
          height: 280,
          background:
            'radial-gradient(circle at 40% 35%, rgba(110,218,228,0.35) 0%, rgba(167,139,250,0.22) 45%, rgba(255,182,255,0.12) 100%)',
        }}
      />

      <motion.div
        animate={currentMotion}
        className="relative z-10 h-[min(85vw,350px)] w-[min(85vw,350px)] max-h-[350px] max-w-[350px] cursor-pointer sm:h-80 sm:w-80"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <motion.img
          src={BLUNNO_MASCOT_PNG}
          alt="Blunno"
          className="w-full h-full object-contain"
          draggable={false}
          decoding="async"
          fetchPriority="high"
          style={{
            filter:
              'drop-shadow(0 0 32px rgba(110,218,228,0.35)) drop-shadow(0 0 48px rgba(167,139,250,0.25))',
          }}
        />
      </motion.div>
    </div>
  );
};
