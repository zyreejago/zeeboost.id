'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BannerData {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isActive: boolean;
}

export default function Banner() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchBanners();
  }, []);
  
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);
  
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/banners');
      const data = await response.json();
      setBanners(data.filter((banner: BannerData) => banner.isActive));
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative h-[60vh] bg-gradient-to-br from-primary via-primary-dark to-primary-600 overflow-hidden rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-black/20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse">
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-white text-xl font-medium animate-bounce">Memuat banner...</div>
              </div>
            </div>
          </div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-primary-light/20 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-primary-300/20 rounded-full animate-float"></div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative h-[60vh] bg-gradient-to-br from-primary via-primary-dark to-primary-600 overflow-hidden rounded-2xl shadow-lg">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute top-20 right-16 w-24 h-24 bg-primary-light/20 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute bottom-16 left-1/3 w-20 h-20 bg-primary-300/20 rounded-full animate-pulse delay-2000"></div>
              <div className="absolute bottom-32 right-1/4 w-16 h-16 bg-primary-200/20 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
          
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-2xl font-semibold opacity-70">Banner akan segera tersedia</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const banner = banners[currentBanner];
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-100">
        {banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={banner.title || 'Banner'}
            className="w-full h-auto aspect-[1920/648] rounded-xl object-cover"
          />
        ) : (
          <div className="w-full h-auto aspect-[1920/648] rounded-xl bg-gradient-to-br from-primary via-primary-dark to-primary-600" />
        )}
        
        {/* Banner indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBanner 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}