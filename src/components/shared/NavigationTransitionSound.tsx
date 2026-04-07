'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactElement } from 'react';

import { playNavigationHoverSoft, unlockAudioSession } from '@/lib/navigationSound';

let lastKnownPath: string | null = null;
let userHasInteracted = false;

export function NavigationTransitionSound(): ReactElement | null {
  const pathname = usePathname();

  // One-time setup: unlock audio after any user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!userHasInteracted) {
        userHasInteracted = true;
        unlockAudioSession();
        console.log('[NavigationSound] Audio unlocked on first user interaction');
      }
    };

    if (!userHasInteracted) {
      document.addEventListener('click', handleFirstInteraction, { once: true });
      document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Route change detection and sound playback
  useEffect(() => {
    if (lastKnownPath === null) {
      lastKnownPath = pathname;
      return;
    }
    if (lastKnownPath !== pathname) {
      console.log(`[NavigationSound] Route changed: ${lastKnownPath} -> ${pathname}`);
      if (userHasInteracted) {
        playNavigationHoverSoft();
      } else {
        console.log('[NavigationSound] Skipped sound – waiting for user interaction');
      }
      lastKnownPath = pathname;
    }
  }, [pathname]);

  return null;
}