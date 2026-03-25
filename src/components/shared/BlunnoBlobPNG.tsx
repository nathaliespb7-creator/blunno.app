'use client';

import { motion, type Variants } from 'framer-motion';
import { useEffect } from 'react';
import { useBlunnoStore, type BlunnoState } from '@/store/blunnoStore';
import { audioService } from '@/services/audioService';

export const BlunnoBlobPNG = () => {
  const { currentState } = useBlunnoStore();

  // Анимации для Blob (масштаб, вращение, свечение)
  const variants: Variants = {
    idle: {
      scale: [1, 1.02, 1],
      rotate: [0, 1, -1, 0],
      filter: [
        'drop-shadow(0 0 8px rgba(100,150,255,0.6))',
        'drop-shadow(0 0 20px rgba(100,150,255,0.9))',
        'drop-shadow(0 0 8px rgba(100,150,255,0.6))',
      ],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    breathing: {
      scale: [1, 1.15, 1],
      rotate: [0, 0, 0, 0],
      filter: 'drop-shadow(0 0 25px rgba(0,200,255,0.9))',
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
    },
    success: {
      scale: [1, 1.3, 1],
      filter: 'drop-shadow(0 0 50px rgba(255,215,0,0.9))',
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    panic: {
      x: [0, -4, 4, -2, 2, 0],
      rotate: [0, -2, 2, -1, 1, 0],
      filter: 'drop-shadow(0 0 35px rgba(255,160,100,0.9))',
      transition: { duration: 0.12, repeat: Infinity, repeatType: 'loop' },
    },
  };

  useEffect(() => {
    if (currentState === 'success') {
      audioService.play('success');
    }
  }, [currentState]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Рассеянное свечение под Blob */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute w-56 h-56 rounded-full bg-blue-500/20 blur-3xl"
      />
      {/* Сам Blob */}
      <motion.img
        src="/blunno.png"
        alt="Blunno"
        width={192}
        height={192}
        variants={variants}
        animate={currentState as BlunnoState}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="relative w-48 h-48 object-contain"
      />
    </div>
  );
};
