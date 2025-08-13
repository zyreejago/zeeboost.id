'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';


interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Animasi masuk
    setTimeout(() => setIsLoaded(true), 100);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Delay untuk animasi fade out
    }, 2000); // Tampilkan splash screen selama 2 detik

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300 opacity-0 pointer-events-none">
        <div className="animate-spin">
          <Image 
            src="/logo.png" 
            alt="Loading..." 
             width={32}
          height={32}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-all duration-300 ${
      isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}>
      <div className="animate-spin">
        <Image 
          src="/logo.png" 
          alt="Loading..." 
          width={128}
          height={128}
          className="w-32 h-32 object-contain"
        />
      </div>
    </div>
  );
}