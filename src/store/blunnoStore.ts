import { create } from 'zustand';

export type BlunnoState = 'idle' | 'breathing' | 'success' | 'panic';
export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'none';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type AnimationPreference = 'full' | 'reduced' | 'none';

interface UIState {
  isLoading: boolean;
  activeModal: string | null;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  themeMode: ThemeMode;
  animationPreference: AnimationPreference;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

interface BlunnoStore {
  // Core Blunno state
  currentState: BlunnoState;
  breathPhase: BreathPhase;
  
  // UI state
  ui: UIState;
  
  // Core actions
  setBlunnoState: (state: BlunnoState) => void;
  setBreathPhase: (phase: BreathPhase) => void;
  triggerSuccess: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAnimationPreference: (preference: AnimationPreference) => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
}

export const useBlunnoStore = create<BlunnoStore>((set, get) => ({
  // Core Blunno state
  currentState: 'idle',
  breathPhase: 'none',
  
  // UI state
  ui: {
    isLoading: false,
    activeModal: null,
    notifications: [],
    themeMode: 'dark',
    animationPreference: 'full',
    soundEnabled: true,
    hapticEnabled: true,
  },
  
  // Core actions
  setBlunnoState: (state) => set({ currentState: state }),
  setBreathPhase: (phase) => set({ breathPhase: phase }),
  triggerSuccess: () => {
    set({ currentState: 'success' });
    setTimeout(() => set({ currentState: 'idle' }), 2000);
  },
  
  // UI actions
  setLoading: (loading) => set((state) => ({ 
    ui: { ...state.ui, isLoading: loading } 
  })),
  
  openModal: (modalId) => set((state) => ({ 
    ui: { ...state.ui, activeModal: modalId } 
  })),
  
  closeModal: () => set((state) => ({ 
    ui: { ...state.ui, activeModal: null } 
  })),
  
  addNotification: (notification) => set((state) => ({
    ui: {
      ...state.ui,
      notifications: [
        ...state.ui.notifications,
        { ...notification, id: crypto.randomUUID() }
      ]
    }
  })),
  
  removeNotification: (id) => set((state) => ({
    ui: {
      ...state.ui,
      notifications: state.ui.notifications.filter(n => n.id !== id)
    }
  })),
  
  setThemeMode: (mode) => set((state) => ({ 
    ui: { ...state.ui, themeMode: mode } 
  })),
  
  setAnimationPreference: (preference) => set((state) => ({ 
    ui: { ...state.ui, animationPreference: preference } 
  })),
  
  toggleSound: () => set((state) => ({ 
    ui: { ...state.ui, soundEnabled: !state.ui.soundEnabled } 
  })),
  
  toggleHaptic: () => set((state) => ({ 
    ui: { ...state.ui, hapticEnabled: !state.ui.hapticEnabled } 
  })),
}));
