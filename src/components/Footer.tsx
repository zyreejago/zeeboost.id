'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-primary-light rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-primary-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed text-lg">
              Platform topup Robux terpercaya #1 di Indonesia dengan harga terjangkau, 
              proses super cepat, dan keamanan terjamin. Bergabung dengan ribuan gamer 
              yang telah mempercayai kami!
            </p>
            
            {/* Social Media */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Ikuti Kami</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com/zeeboost.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                >
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <i className="fas fa-envelope w-5 h-5 mr-3 text-primary"></i>
                <span>support@zeeboost.com</span>
              </div>
              <div className="flex items-center text-gray-300">
                <i className="fas fa-phone w-5 h-5 mr-3 text-primary"></i>
                <span>+6287740517441</span>
              </div>
              <div className="flex items-center text-gray-300">
                <i className="fas fa-clock w-5 h-5 mr-3 text-primary"></i>
                <span>Customer Service 24/7</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Menu Utama
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-home w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/topup" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-coins w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Topup Robux
                </Link>
              </li>
              <li>
                <Link href="/news" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-newspaper w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Berita
                </Link>
              </li>
              <li>
                <Link href="/check-order" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-search w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Cek Pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Bantuan & Legal
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/faq" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-question w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-file-contract w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <a href="mailto:support@zeeboost.com" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-headset w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-lg">
                &copy; 2024 <span className="font-semibold text-primary">ZeeBoost</span>. Semua hak cipta dilindungi.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Platform topup Robux terpercaya di Indonesia
              </p>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-300">
                <i className="fas fa-shield-check text-green-400 mr-2"></i>
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center text-gray-300">
                <i className="fas fa-lock text-primary mr-2"></i>
                <span className="text-sm">Data Protected</span>
              </div>
              <div className="flex items-center text-gray-300">
                <i className="fas fa-star text-yellow-400 mr-2"></i>
                <span className="text-sm">Trusted Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}