import { Howl, Howler } from 'howler';

/**
 * Mobile Safari / Chrome require a user gesture before audio; Web Audio may stay
 * suspended until resumed. Use AudioUnlock + unlockAudioSession.
 * html5: true + preload improve MP3 playback on mobile browsers.
 */

let navigationPop: Howl | null = null;
let hoverSoftSound: Howl | null = null;
let inhaleSound: Howl | null = null;
let exhaleSound: Howl | null = null;

const howlOpts = {
  volume: 0.4,
  preload: true as const,
  html5: true as const,
};

/** Warm all app sounds after first user gesture (mobile-friendly). */
function preloadAppSounds(): void {
  if (typeof window === 'undefined') return;
  getHoverSoftSound();
  getInhaleSound();
  getExhaleSound();
}

/** Welcome / route transitions — soft hover cue */
function getHoverSoftSound(): Howl | null {
  if (typeof window === 'undefined') return null;
  if (!hoverSoftSound) {
    hoverSoftSound = new Howl({
      src: ['/sounds/hover-soft.mp3'],
      volume: 0.15,
      rate: 1.2,
      preload: true,
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

/** Shared exhale asset (e.g. SOS); same preload/html5 as other app sounds. */
export function getExhaleSound(): Howl | null {
  if (typeof window === 'undefined') return null;
  if (!exhaleSound) {
    exhaleSound = new Howl({
      src: ['/sounds/exhale.mp3'],
      ...howlOpts,
      onloaderror: (_id, err) => {
        console.warn('[sos] exhale.mp3 unavailable:', err);
      },
    });
  }
  return exhaleSound;
}

/** Call on first user interaction so route / task sounds can play on mobile. Idempotent. */
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
  preloadAppSounds();
}

/** Legacy pop (optional); prefer playNavigationHoverSoft for route changes. */
export function playNavigationPop(): void {
  try {
    getNavigationPop()?.play();
  } catch (e) {
    console.warn('[nav] pop play failed:', e);
  }
}

/** Play on every client-side route change — same file as Welcome hover. */
export function playNavigationHoverSoft(): void {
  if (typeof window === 'undefined') return;
  unlockAudioSession();
  try {
    getHoverSoftSound()?.play();
  } catch (e) {
    console.warn('[nav] hover-soft play failed:', e);
  }
}

/** Planner: task marked complete (false → true). Call in the same tick as the user gesture. */
export function playTaskCompleteInhale(): void {
  if (typeof window === 'undefined') return;
  unlockAudioSession();
  try {
    getInhaleSound()?.play();
  } catch (e) {
    console.warn('[planner] inhale play failed:', e);
  }
}
