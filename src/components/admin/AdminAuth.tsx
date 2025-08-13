'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Gunakan API yang memerlukan autentikasi
        const response = await fetch('/api/admin/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } catch (_error) {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jika tidak terautentikasi, tidak render apa-apa (akan redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Jika terautentikasi, render children
  return <>{children}</>;
}