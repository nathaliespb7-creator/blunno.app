'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactElement } from 'react';

import { playNavigationPop } from '@/lib/navigationSound';

/** Survives Strict Mode remounts so we don’t double-fire incorrectly. */
let lastKnownPath: string | null = null;

/**
 * Plays the same pop as Welcome → Choose whenever the app route changes
 * (Link, router.push, back/forward). Skips the first paint for the current URL.
 */
export function NavigationTransitionSound(): ReactElement | null {
  const pathname = usePathname();

  useEffect(() => {
    if (lastKnownPath === null) {
      lastKnownPath = pathname;
      return;
    }
    if (lastKnownPath !== pathname) {
      playNavigationPop();
      lastKnownPath = pathname;
    }
  }, [pathname]);

  return null;
}
