import type { Howl } from 'howler';

/** Same transition cue as Welcome → Choose (`/sounds/pop.mp3`). */
let navigationPop: Howl | null = null;
let soundsReady: Promise<void> | null = null;

async function ensureNavigationSounds(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (soundsReady) return soundsReady;
  soundsReady = (async () => {
    try {
      const { Howl } = await import('howler');
      navigationPop = new Howl({
        src: ['/sounds/pop.mp3'],
        volume: 0.4,
        preload: false,
        onloaderror: (_id, err) => {
          console.warn('[nav] pop sound unavailable:', err);
        },
      });
    } catch (e) {
      console.warn('[nav] failed to init navigation sound:', e);
    }
  })();
  return soundsReady;
}

/** Play on client-side route changes (see NavigationTransitionSound). */
export function playNavigationPop(): void {
  void ensureNavigationSounds().then(() => navigationPop?.play());
}
