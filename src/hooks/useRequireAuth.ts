import { useAuthStore } from '../store/useAuthStore';
import { useMemo } from 'react';

export function useRequireAuth() {
  const { user, status: authStatus } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('evos_token') : null;

  return useMemo(() => {
    const isAuthed = !!user;
    const isVerifying = !user && !!token && authStatus === 'loading';
    const isBlocked = !user && (!token || authStatus === 'unauthed');

    return { user, authStatus, isAuthed, isVerifying, isBlocked };
  }, [user, authStatus, token]);
}
