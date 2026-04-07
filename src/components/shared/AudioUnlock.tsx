'use client';

import { useEffect, type ReactElement } from 'react';

import { unlockAudioSession } from '@/lib/navigationSound';

/**
 * iOS/Android: resume Web Audio on first touch so Howler sounds work for later
 * navigation (useEffect) and task toggles. Capture phase runs before link navigation.
 */
export function AudioUnlock(): ReactElement | null {
  useEffect(() => {
    const onPointer = () => {
      unlockAudioSession();
    };
    document.addEventListener('pointerdown', onPointer, { capture: true, passive: true });
    return () => document.removeEventListener('pointerdown', onPointer, { capture: true });
  }, []);

  return null;
}
