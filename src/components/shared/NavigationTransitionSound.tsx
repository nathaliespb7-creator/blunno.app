'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactElement } from 'react';

import { playNavigationHoverSoft, unlockAudioSession } from '@/lib/navigationSound';

/** Survives Strict Mode remounts so we don't double-fire incorrectly. */
let lastKnownPath: string | null = null;
let userHasInteracted = false;

/**
 * Plays hover-soft on every client-side route change (Link, router.push, back/forward).
 * Skips the first paint for the current URL.
 * Unlocks audio on first user interaction (click/touch) to comply with browser policies.
 */
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
      // Play sound only after user has interacted (audio is unlocked)
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