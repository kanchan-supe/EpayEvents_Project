import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to get the active Supabase session and loading state.
 */
export function useSession() {
  const { session, loading } = useAuth();
  return {
    session,
    loading,
  };
}

export default useSession;

