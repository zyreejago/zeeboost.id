'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
                    {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Beranda
            </Link>
            {/* <Link href="/topup" className="text-foreground hover:text-primary transition-colors">
              Topup Robux
            </Link> */}
            <Link href="/news" className="text-foreground hover:text-primary transition-colors">
              Berita
            </Link>
            <Link href="/check-order" className="text-foreground hover:text-primary transition-colors">
              Cek Pesanan
            </Link>
            {/* <Link href="/kontak" className="text-foreground hover:text-primary transition-colors">
              Kontak
            </Link> */}
            <Link 
              href="/topup" 
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Mulai Topup
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center px-3 py-2 border rounded text-foreground border-border hover:text-primary hover:border-primary"
          >
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-border">
              <Link 
                href="/" 
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link 
                href="/topup" 
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Topup Robux
              </Link>
              <Link 
                href="/cara-topup" 
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cara Topup
              </Link>
              <Link 
                href="/kontak" 
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontak
              </Link>
              <Link 
                href="/topup" 
                className="block mx-3 mt-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Mulai Topup
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}