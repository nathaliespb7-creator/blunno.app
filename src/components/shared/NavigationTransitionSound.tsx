'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactElement } from 'react';

import { playNavigationHoverSoft, unlockAudioSession } from '@/lib/navigationSound';

/** Survives Strict Mode remounts so we don’t double-fire incorrectly. */
let lastKnownPath: string | null = null;

/**
 * Plays hover-soft on every client-side route change (Link, router.push, back/forward).
 * Skips the first paint for the current URL.
 */
export function NavigationTransitionSound(): ReactElement | null {
  const pathname = usePathname();

  useEffect(() => {
    if (lastKnownPath === null) {
      lastKnownPath = pathname;
      return;
    }
    if (lastKnownPath !== pathname) {
      unlockAudioSession();
      playNavigationHoverSoft();
      lastKnownPath = pathname;
    }
  }, [pathname]);

  return null;
}
