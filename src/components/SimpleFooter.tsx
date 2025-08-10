'use client';

import Link from 'next/link';

export default function SimpleFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-700 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-xl font-bold text-gray-800">ZeeBoost</span>
          </div>
          
          {/* Quick Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link href="/cara-topup" className="text-gray-600 hover:text-primary transition-colors">
              Cara Topup
            </Link>
            <Link href="/kontak" className="text-gray-600 hover:text-primary transition-colors">
              Kontak
            </Link>
          </div>
          
          {/* Trust Badge */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <i className="fas fa-shield-check text-green-500"></i>
            <span>Platform Terpercaya</span>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-200 mt-6 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2024 <span className="text-primary font-semibold">ZeeBoost</span>. Semua hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}