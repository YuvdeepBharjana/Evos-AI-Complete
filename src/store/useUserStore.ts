import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, IdentityNode, Message } from '../types';

interface UserStore {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateNodes: (nodes: IdentityNode[]) => void;
  addMessage: (message: Message) => void;
  completeOnboarding: (method: 'questionnaire' | 'upload', nodes: IdentityNode[]) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      
      setUser: (user) => set({ user }),
      
      updateNodes: (nodes) => set((state) => ({
        user: state.user ? { ...state.user, identityNodes: nodes } : null
      })),
      
      addMessage: (message) => set((state) => ({
        user: state.user ? {
          ...state.user,
          chatHistory: [...state.user.chatHistory, message]
        } : null
      })),
      
      completeOnboarding: (method, nodes) => set((state) => ({
        user: state.user ? {
          ...state.user,
          onboardingComplete: true,
          onboardingMethod: method,
          identityNodes: nodes
        } : null
      })),
      
      clearUser: () => set({ user: null })
    }),
    {
      name: 'evos-user-storage'
    }
  )
);

