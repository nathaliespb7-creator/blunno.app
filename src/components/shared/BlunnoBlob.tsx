'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { useBlunnoStore } from '@/store/blunnoStore';
import { audioService } from '@/services/audioService';
import type { BlunnoState } from '@/store/blunnoStore';

const animations: Record<
  BlunnoState,
  {
    scale: number | number[];
    filter: string | string[];
    transition: {
      duration: number;
      repeat?: number;
      repeatType?: 'reverse';
      ease?: 'easeInOut' | 'easeOut';
    };
  }
> = {
  idle: {
    scale: [1, 1.02, 1],
    filter: [
      'drop-shadow(0 0 5px rgba(100,200,255,0.3))',
      'drop-shadow(0 0 15px rgba(100,200,255,0.6))',
      'drop-shadow(0 0 5px rgba(100,200,255,0.3))',
    ],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  breathing: {
    scale: [1, 1.2, 1],
    filter: 'drop-shadow(0 0 20px rgba(0,200,255,0.8))',
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  sos_active: {
    scale: [1, 1.1, 1],
    filter: 'drop-shadow(0 0 30px rgba(255,100,100,0.8))',
    transition: { duration: 1, repeat: Infinity, repeatType: 'reverse' },
  },
  success: {
    scale: [1, 1.3, 1],
    filter: 'drop-shadow(0 0 40px rgba(255,215,0,0.9))',
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const BlunnoBlob = () => {
  const { state, setState } = useBlunnoStore();
  const controls = useAnimation();

  useEffect(() => {
    void controls.start(animations[state]);
    if (state === 'success') {
      audioService.play('success');
      setTimeout(() => setState('idle'), 1000);
    }
    if (state === 'sos_active') {
      audioService.play('sos');
    }
  }, [state, controls, setState]);

  return (
    <motion.div
      animate={controls}
      style={{
        width: 160,
        height: 160,
        background: 'radial-gradient(circle at 30% 30%, #6a4eff, #2a2a72)',
        borderRadius: '60% 40% 50% 50% / 45% 40% 55% 50%',
        cursor: 'pointer',
        boxShadow: '0 0 30px rgba(100,100,255,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    />
  );
};
