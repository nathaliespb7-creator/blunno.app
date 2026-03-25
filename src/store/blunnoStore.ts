import { create } from 'zustand';

export type BlunnoState = 'idle' | 'breathing' | 'success' | 'panic';
export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'none';

interface BlunnoStore {
  currentState: BlunnoState;
  breathPhase: BreathPhase;
  setBlunnoState: (state: BlunnoState) => void;
  setBreathPhase: (phase: BreathPhase) => void;
  triggerSuccess: () => void;
}

export const useBlunnoStore = create<BlunnoStore>((set) => ({
  currentState: 'idle',
  breathPhase: 'none',
  setBlunnoState: (state) => set({ currentState: state }),
  setBreathPhase: (phase) => set({ breathPhase: phase }),
  triggerSuccess: () => {
    set({ currentState: 'success' });
    setTimeout(() => set({ currentState: 'idle' }), 2000);
  },
}));
