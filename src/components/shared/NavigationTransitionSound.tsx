'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactElement } from 'react';

import { playNavigationHoverSoft, unlockAudioSession } from '@/lib/navigationSound';

let lastKnownPath: string | null = null;
let userHasInteracted = false;

export function NavigationTransitionSound(): ReactElement | null {
  const pathname = usePathname();

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (userHasInteracted) return;
      userHasInteracted = true;
      unlockAudioSession();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction, { passive: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (lastKnownPath === null) {
      lastKnownPath = pathname;
      return;
    }
    if (lastKnownPath !== pathname) {
      if (userHasInteracted) {
        playNavigationHoverSoft();
      }
      lastKnownPath = pathname;
    }
  }, [pathname]);

  return null;
}
