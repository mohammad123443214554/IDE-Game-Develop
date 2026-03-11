import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) {
      if (user) router.push(`/profile/${user.username}`);
      else router.push('/login');
    }
  }, [user, loading]);
  return null;
}
