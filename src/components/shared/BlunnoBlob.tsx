'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import { useBlunnoStore, type BlunnoState, type BreathPhase } from '@/store/blunnoStore';

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
        className="absolute rounded-full blur-3xl pointer-events-none"
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 240, height: 240, background: 'rgba(189,178,255,0.20)' }}
      />

      <motion.div
        animate={currentMotion}
        className="relative z-10 w-56 h-56 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <motion.img
          src="/blunno.png"
          alt="Blunno"
          className="w-full h-full object-contain"
          draggable={false}
          // лёгкий glass / glow вокруг, но без “прыгающих глаз”, т.к. это часть картинки
          style={{
            filter: 'drop-shadow(0 0 28px rgba(189,178,255,0.45))',
          }}
        />
      </motion.div>
    </div>
  );
};
