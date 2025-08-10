'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SimpleFooter from '@/components/SimpleFooter';
import ChatCS from '@/components/ChatCS';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-4xl"></i>
            </div>
          </div>
          
          {/* Error Content */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
              Oops! Terjadi Kesalahan
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang memperbaikinya.
            </p>
            
            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <p className="text-sm text-red-700 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              <i className="fas fa-redo mr-2"></i>
              Coba Lagi
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              <i className="fas fa-home mr-2"></i>
              Kembali ke Beranda
            </a>
          </div>
          
          {/* Help Section */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              <i className="fas fa-question-circle mr-2"></i>
              Butuh Bantuan?
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Jika masalah terus berlanjut, jangan ragu untuk menghubungi tim support kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:support@zeeboost.com"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <i className="fas fa-envelope mr-2"></i>
                support@zeeboost.com
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <SimpleFooter />
      <ChatCS />
    </>
  );
}