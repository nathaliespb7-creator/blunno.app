import { Howl, Howler } from 'howler';

/**
 * Mobile Safari / Chrome require a user gesture before audio; Web Audio may stay
 * suspended until resumed. Use AudioUnlock (capture pointerdown) + unlockAudioSession.
 * html5: true improves MP3 playback on many mobile browsers.
 */

let navigationPop: Howl | null = null;
let hoverSoftSound: Howl | null = null;
let inhaleSound: Howl | null = null;

const howlOpts = {
  volume: 0.4,
  preload: false as const,
  html5: true as const,
};

/** Welcome / route transitions — soft hover cue */
function getHoverSoftSound(): Howl | null {
  if (typeof window === 'undefined') return null;
  if (!hoverSoftSound) {
    hoverSoftSound = new Howl({
      src: ['/sounds/hover-soft.mp3'],
      volume: 0.15,
      rate: 1.2,
      preload: false,
      html5: true,
      onloaderror: (_id, err) => {
        console.warn('[nav] hover-soft.mp3 unavailable:', err);
      },
    });
  }
  return hoverSoftSound;
}

function getNavigationPop(): Howl | null {
  if (typeof window === 'undefined') return null;
  if (!navigationPop) {
    navigationPop = new Howl({
      src: ['/sounds/pop.mp3'],
      ...howlOpts,
      onloaderror: (_id, err) => {
        console.warn('[nav] pop sound unavailable:', err);
      },
    });
  }
  return navigationPop;
}

function getInhaleSound(): Howl | null {
  if (typeof window === 'undefined') return null;
  if (!inhaleSound) {
    inhaleSound = new Howl({
      src: ['/sounds/inhale.mp3'],
      ...howlOpts,
      onloaderror: (_id, err) => {
        console.warn('[planner] inhale.mp3 unavailable:', err);
      },
    });
  }
  return inhaleSound;
}

/** Call on first user interaction (see AudioUnlock) so route / async sounds can play. */
export function unlockAudioSession(): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  } catch (e) {
    console.warn('[audio] unlock failed:', e);
  }
}

/** Legacy pop (optional); prefer playNavigationHoverSoft for route changes. */
export function playNavigationPop(): void {
  try {
    getNavigationPop()?.play();
  } catch (e) {
    console.warn('[nav] pop play failed:', e);
  }
}

/** Play on every client-side route change (enter/leave) — same file as Welcome hover. */
export function playNavigationHoverSoft(): void {
  try {
    getHoverSoftSound()?.play();
  } catch (e) {
    console.warn('[nav] hover-soft play failed:', e);
  }
}

/** Planner: task marked complete (false → true) only — call synchronously in the click path. */
export function playTaskCompleteInhale(): void {
  if (typeof window === 'undefined') return;
  try {
    getInhaleSound()?.play();
  } catch (e) {
    console.warn('[planner] inhale play failed:', e);
  }
}
