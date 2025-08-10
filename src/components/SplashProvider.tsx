'use client';

import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

interface SplashProviderProps {
  children: React.ReactNode;
}

export default function SplashProvider({ children }: SplashProviderProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulasi loading (bisa diganti dengan logic loading sebenarnya)
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(loadTimer);
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && isLoaded && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}
      <div className={showSplash ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>
    </>
  );
}