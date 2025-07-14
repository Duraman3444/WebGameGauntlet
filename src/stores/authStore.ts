import { create } from 'zustand';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  setUser: (user: any | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement Supabase sign in
      console.log('Signing in with:', email);
      // Mock user for now
      set({ user: { email }, isLoading: false });
    } catch (error) {
      console.error('Sign in error:', error);
      set({ isLoading: false });
    }
  },
  signOut: () => {
    set({ user: null });
  },
  setUser: (user: any | null) => {
    set({ user });
  },
}));
