import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to get the currently authenticated user, profile, role, and loading state.
 */
export function useUser() {
  const { user, profile, role, loading, isAdmin, isOrganizer, isAttendee } = useAuth();
  return {
    user,
    profile,
    role,
    loading,
    isAdmin,
    isOrganizer,
    isAttendee,
  };
}

export default useUser;

