'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
  instanceId?: string;
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

// Global state untuk script loading
let scriptLoaded = false;
let scriptLoading = false;
let loadPromise: Promise<void> | null = null;

// Track semua widget instances
const widgetInstances = new Map<string, {
  widgetId: number;
  element: HTMLElement;
}>(); 

// Counter untuk unique ID yang konsisten
let instanceCounter = 0;

// Timeout constants
const SCRIPT_LOAD_TIMEOUT = 10000; // 10 detik
const RENDER_TIMEOUT = 5000; // 5 detik

export default function ReCaptcha({
  siteKey,
  onVerify,
  onExpired,
  onError,
  theme = 'light',
  size = 'normal',
  className = '',
  instanceId = 'default'
}: ReCaptchaProps) {
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate stable ID yang konsisten untuk SSR
  const stableInstanceId = useRef<string>('');
  
  // Initialize stable ID hanya di client
  useEffect(() => {
    if (!stableInstanceId.current) {
      instanceCounter++;
      stableInstanceId.current = `${instanceId}-${instanceCounter}`;
    }
    setIsMounted(true);
  }, [instanceId]);
  
  const currentInstanceId = stableInstanceId.current;

  // Cleanup function yang lebih robust
  const cleanup = useCallback(() => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const instance = widgetInstances.get(currentInstanceId);
    if (instance && window.grecaptcha) {
      try {
        // Reset widget terlebih dahulu
        window.grecaptcha.reset(instance.widgetId);
        
        // Hapus dari tracking
        widgetInstances.delete(currentInstanceId);
        
        // Clear element content
        if (instance.element && instance.element.parentNode) {
          instance.element.innerHTML = '';
        }
        
        console.log(`Cleaned up reCAPTCHA instance: ${currentInstanceId}`);
      } catch (error) {
        console.warn('Error during reCAPTCHA cleanup:', error);
        // Force cleanup jika ada error
        widgetInstances.delete(currentInstanceId);
        if (instance.element) {
          instance.element.innerHTML = '';
        }
      }
    }
    
    if (mountedRef.current) {
      setIsLoaded(false);
      setIsRendering(false);
      setLoadError(false);
      setErrorMessage('');
    }
  }, [currentInstanceId]);

  // Reset function
  const reset = useCallback(() => {
    const instance = widgetInstances.get(currentInstanceId);
    if (instance && window.grecaptcha) {
      try {
        window.grecaptcha.reset(instance.widgetId);
      } catch (error) {
        console.warn('Failed to reset reCAPTCHA:', error);
      }
    }
  }, [currentInstanceId]);

  // Load reCAPTCHA script dengan timeout
  const loadScript = useCallback((): Promise<void> => {
    if (scriptLoaded) {
      return Promise.resolve();
    }
    
    if (loadPromise) {
      return loadPromise;
    }
    
    if (scriptLoading) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Script loading timeout'));
        }, SCRIPT_LOAD_TIMEOUT);

        const checkLoaded = () => {
          if (scriptLoaded) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    scriptLoading = true;
    
    loadPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        scriptLoading = false;
        loadPromise = null;
        reject(new Error(`reCAPTCHA script loading timeout after ${SCRIPT_LOAD_TIMEOUT}ms`));
      }, SCRIPT_LOAD_TIMEOUT);

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit&hl=en`;
      script.async = true;
      script.defer = true;
      
      window.onRecaptchaLoad = () => {
        clearTimeout(timeout);
        scriptLoaded = true;
        scriptLoading = false;
        resolve();
      };
      
      script.onload = () => {
        // Fallback jika onRecaptchaLoad tidak dipanggil
        setTimeout(() => {
          if (!scriptLoaded && window.grecaptcha) {
            clearTimeout(timeout);
            scriptLoaded = true;
            scriptLoading = false;
            resolve();
          }
        }, 1000);
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        scriptLoading = false;
        loadPromise = null;
        reject(new Error('Failed to load reCAPTCHA script'));
      };
      
      document.head.appendChild(script);
    });
    
    return loadPromise;
  }, []);

  // Render reCAPTCHA widget dengan timeout
  const renderRecaptcha = useCallback(async () => {
    if (!mountedRef.current || !recaptchaRef.current || isRendering || !isMounted) {
      return;
    }

    // Cek apakah instance sudah ada
    if (widgetInstances.has(currentInstanceId)) {
    //   console.warn(`reCAPTCHA instance ${currentInstanceId} already exists`);
      return;
    }

    setIsRendering(true);
    setLoadError(false);
    setErrorMessage('');

    // Set timeout untuk rendering
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setLoadError(true);
        setErrorMessage(`reCAPTCHA rendering timeout after ${RENDER_TIMEOUT}ms`);
        setIsRendering(false);
        if (onError) onError();
      }
    }, RENDER_TIMEOUT);

    try {
      // Pastikan script sudah loaded
      await loadScript();
      
      if (!mountedRef.current || !recaptchaRef.current) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsRendering(false);
        return;
      }

      // Pastikan grecaptcha tersedia
      if (!window.grecaptcha || !window.grecaptcha.render) {
        throw new Error('reCAPTCHA API not available');
      }

      // Clear element content
      recaptchaRef.current.innerHTML = '';
      
      // Render widget
      const widgetId = window.grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          if (mountedRef.current) {
            setLoadError(false);
            setErrorMessage('');
            onVerify(token);
          }
        },
        'expired-callback': () => {
          if (mountedRef.current && onExpired) {
            onExpired();
          }
        },
        'error-callback': () => {
          if (mountedRef.current) {
            setLoadError(true);
            setErrorMessage('reCAPTCHA verification failed');
            if (onError) onError();
          }
        },
        theme: theme,
        size: size
      });
      
      // Store instance
      widgetInstances.set(currentInstanceId, {
        widgetId,
        element: recaptchaRef.current
      });

      // Clear timeout karena berhasil
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (mountedRef.current) {
        setIsLoaded(true);
        setLoadError(false);
        setErrorMessage('');
        console.log(`reCAPTCHA rendered successfully: ${currentInstanceId}`);
      }
    } catch (error) {
      console.error('Error rendering reCAPTCHA:', error);
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (mountedRef.current) {
        setLoadError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        if (onError) onError();
      }
    } finally {
      if (mountedRef.current) {
        setIsRendering(false);
      }
    }
  }, [siteKey, onVerify, onExpired, onError, theme, size, currentInstanceId, loadScript, isRendering, isMounted]);

  // Effect untuk render hanya di client
  useEffect(() => {
    if (!isMounted) return;
    
    mountedRef.current = true;
    renderRecaptcha();
    
    return () => {
      mountedRef.current = false;
    };
  }, [renderRecaptcha, isMounted]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      cleanup();
      mountedRef.current = false;
    };
  }, [cleanup]);

  // Expose reset method
  useEffect(() => {
    if (recaptchaRef.current) {
      (recaptchaRef.current as any).reset = reset;
    }
  }, [reset]);

  // Jangan render apapun di server
  if (!isMounted) {
    return (
      <div className={`recaptcha-container ${className}`}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Initializing reCAPTCHA...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`recaptcha-container ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm mb-2">
            {errorMessage || 'Failed to load reCAPTCHA. Please check your internet connection and try again.'}
          </p>
          <button 
            onClick={() => {
              setLoadError(false);
              setErrorMessage('');
              setIsLoaded(false);
              setIsRendering(false);
              cleanup();
              // Retry render
              setTimeout(() => {
                if (mountedRef.current) {
                  renderRecaptcha();
                }
              }, 100);
            }} 
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`recaptcha-container ${className}`}>
      {(!isLoaded || isRendering) && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            {isRendering ? 'Rendering reCAPTCHA...' : 'Loading reCAPTCHA...'}
          </span>
        </div>
      )}
      <div 
        ref={recaptchaRef} 
        style={{ display: isLoaded && !isRendering ? 'block' : 'none' }}
        data-instance-id={currentInstanceId}
      ></div>
    </div>
  );
}