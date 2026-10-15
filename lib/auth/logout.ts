'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/store';
import { logout } from '@/store/Auth/authSlice';
import { toast } from 'react-toastify';

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // 1. Dispatch Redux logout action
    try {
      dispatch(logout());
    } catch {}

    // 2. Clear client storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('mcenies_auth_user');
        sessionStorage.clear();
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      } catch {}
    }

    // 3. User feedback
    try {
      toast.success('Logged out successfully');
    } catch {}

    // 4. Redirect to login
    router.push('/login');
  };

  return { handleLogout };
}
