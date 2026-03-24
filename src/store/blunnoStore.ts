import { create } from 'zustand';

export type BlunnoState = 'idle' | 'breathing' | 'sos_active' | 'success';

interface BlunnoStore {
  state: BlunnoState;
  setState: (newState: BlunnoState) => void;
  triggerBreathing: () => void;
  triggerSOS: () => void;
  triggerSuccess: () => void;
}

export const useBlunnoStore = create<BlunnoStore>((set) => ({
  state: 'idle',
  setState: (newState) => set({ state: newState }),
  triggerBreathing: () => {
    set({ state: 'breathing' });
    setTimeout(() => set({ state: 'idle' }), 4000);
  },
  triggerSOS: () => {
    set({ state: 'sos_active' });
  },
  triggerSuccess: () => {
    set({ state: 'success' });
  },
}));
