import { useEffect, useState } from 'react';
import { User } from '../types';
import { getCurrentUserProfile } from '../services/authService';
import { useAuth } from './useAuth';

export function useCurrentUser() {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    getCurrentUserProfile(authUser.uid).then((profile) => {
      setUserProfile(profile);
      setLoading(false);
    });
  }, [authUser]);

  return { userProfile, loading };
}
