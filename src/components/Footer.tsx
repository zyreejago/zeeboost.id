'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
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
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">Z</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">ZeeBoost</span>
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
                <a href="#" className="group w-12 h-12 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <i className="fab fa-facebook-f text-gray-300 group-hover:text-white transition-colors"></i>
                </a>
                <a href="#" className="group w-12 h-12 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <i className="fab fa-instagram text-gray-300 group-hover:text-white transition-colors"></i>
                </a>
                <a href="#" className="group w-12 h-12 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <i className="fab fa-twitter text-gray-300 group-hover:text-white transition-colors"></i>
                </a>
                <a href="#" className="group w-12 h-12 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <i className="fab fa-discord text-gray-300 group-hover:text-white transition-colors"></i>
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
                <span>+62 812-3456-7890</span>
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
                <Link href="/cara-topup" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-question-circle w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Cara Topup
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-envelope w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Kontak Kami
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
                <Link href="/syarat-ketentuan" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-file-contract w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-shield-alt w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="group flex items-center text-gray-300 hover:text-primary transition-colors duration-300">
                  <i className="fas fa-undo w-4 h-4 mr-3 group-hover:scale-110 transition-transform"></i>
                  Kebijakan Refund
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
                <i className="fas fa-lock text-blue-400 mr-2"></i>
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