'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SimpleFooter from '@/components/SimpleFooter';
import ChatCS from '@/components/ChatCS';
import GamepassTopup from './gamepass';
import ViaLoginTopup from './vialogin';

export default function TopupPage() {
  const [activeMethod, setActiveMethod] = useState<'gamepass' | 'login'>('gamepass');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section dengan Gradient dan Pattern - Responsive */}
        <div className="relative bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white rounded-full blur-2xl sm:blur-3xl"></div>
            <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-12 sm:w-16 lg:w-24 h-12 sm:h-16 lg:h-24 bg-white rounded-full blur-xl sm:blur-2xl"></div>
            <div className="absolute bottom-5 sm:bottom-10 left-1/4 sm:left-1/3 w-14 sm:w-20 lg:w-28 h-14 sm:h-20 lg:h-28 bg-white rounded-full blur-2xl sm:blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 mb-3 sm:mb-4">
              <i className="fas fa-coins text-yellow-300 mr-1.5 text-xs sm:text-sm"></i>
              <span className="text-xs font-medium">Platform Topup #1 Indonesia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent leading-tight">
              Topup Robux Sekarang
            </h1>
            <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-4 sm:mb-6 max-w-xl mx-auto leading-relaxed px-4">
              Pilih jumlah Robux dan metode topup yang Anda inginkan.
              Proses cepat, aman, dan terpercaya!
            </p>
            
            {/* Stats - Ukuran lebih kecil untuk desktop */}
            <div className="flex justify-center items-center space-x-3 sm:space-x-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[60px]">
                <div className="text-sm sm:text-base font-bold">10K+</div>
                <div className="text-xs opacity-80">Transaksi</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[60px]">
                <div className="text-sm sm:text-base font-bold">24/7</div>
                <div className="text-xs opacity-80">Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[60px]">
                <div className="text-sm sm:text-base font-bold">100%</div>
                <div className="text-xs opacity-80">Aman</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto py-8 sm:py-12 lg:py-16 px-4">
          {/* Method Selection dengan Card Design - Responsive */}
          <div className="mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">Pilih Metode Topup</h2>
              <p className="text-sm sm:text-base text-gray-600">Pilih metode yang paling sesuai untuk Anda</p>
            </div>
            
            <div className="space-y-6">
              {/* Row 1 - Via Gamepass & Via Login */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1 - Via Gamepass */}
                <button
                  onClick={() => setActiveMethod('gamepass')}
                  className={`group p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    activeMethod === 'gamepass'
                      ? 'border-primary bg-gradient-to-br from-primary-50 to-primary-100 shadow-primary/20'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-start space-x-4 h-full">
                    <div className={`w-6 h-6 rounded-full border-2 mt-1 transition-all ${
                      activeMethod === 'gamepass' 
                        ? 'bg-primary border-primary shadow-lg' 
                        : 'border-gray-300 group-hover:border-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <i className="fas fa-gamepad text-primary text-xl"></i>
                        <h3 className="font-bold text-xl text-gray-800">Via Gamepass</h3>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Recommended</span>
                      </div>
                      <p className="text-base text-gray-600 mb-4">Topup melalui pembelian gamepass Roblox</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-shield-alt mr-1"></i>
                          <span>100% Aman</span>
                        </div>
                        <div className="flex items-center text-blue-600">
                          <i className="fas fa-clock mr-1"></i>
                          <span>Delay 5 Hari</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Card 2 - Via Login */}
                <button
                  onClick={() => setActiveMethod('login')}
                  className={`group p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    activeMethod === 'login'
                      ? 'border-primary bg-gradient-to-br from-primary-50 to-primary-100 shadow-primary/20'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-start space-x-4 h-full">
                    <div className={`w-6 h-6 rounded-full border-2 mt-1 transition-all ${
                      activeMethod === 'login' 
                        ? 'bg-primary border-primary shadow-lg' 
                        : 'border-gray-300 group-hover:border-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <i className="fas fa-sign-in-alt text-primary text-xl"></i>
                        <h3 className="font-bold text-xl text-gray-800">Via Login</h3>
                      </div>
                      <p className="text-base text-gray-600 mb-4">Topup melalui login akun Roblox kalian</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-blue-600">
                          <i className="fas fa-shield-alt mr-1"></i>
                          <span>Robux Instan</span>
                        </div>
                        <div className="flex items-center text-purple-600">
                          <i className="fas fa-user-lock mr-1"></i>
                          <span>Secure Login</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Row 2 - Via Gift Card (Full Width) */}
              <div className="relative group p-6 lg:p-8 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-100 text-left shadow-lg cursor-not-allowed overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Disabled overlay dengan efek glassmorphism */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 backdrop-blur-[2px] z-10 rounded-2xl"></div>
                
                <div className="relative z-0 flex items-start space-x-4 h-full">
                  <div className="w-6 h-6 rounded-full border-2 border-orange-300 bg-orange-100 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-3">
                      <i className="fas fa-gift text-orange-600 text-xl"></i>
                      <h3 className="font-bold text-xl text-gray-800">Via Gift Card</h3>
                      <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-medium border border-orange-300">Coming Soon</span>
                    </div>
                    <p className="text-base text-gray-600 mb-4">Topup menggunakan Roblox Gift Card - Segera tersedia untuk kemudahan Anda</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center text-orange-600">
                        <i className="fas fa-credit-card mr-1"></i>
                        <span>Gift Card Support</span>
                      </div>
                      {/* <div className="flex items-center text-green-600">
                        <i className="fas fa-star mr-1"></i>
                        <span>Premium Feature</span>
                      </div> */}
                      <div className="flex items-center text-blue-600">
                        <i className="fas fa-clock mr-1"></i>
                        <span>Segera Hadir</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/40 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-3000 ease-in-out"></div>
                
                {/* Decorative elements */}
                <div className="absolute top-6 right-6 w-4 h-4 bg-orange-300 rounded-full opacity-60"></div>
                <div className="absolute bottom-6 right-8 w-3 h-3 bg-orange-400 rounded-full opacity-40"></div>
                <div className="absolute top-1/2 right-10 w-2 h-2 bg-orange-500 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>
          
          {/* Render komponen berdasarkan metode yang dipilih */}
          {activeMethod === 'gamepass' && <GamepassTopup />}
          {activeMethod === 'login' && <ViaLoginTopup />}
        </div>
      </main>
      <SimpleFooter />
      <ChatCS />
    </>
  );
}

// HAPUS EXPORT METADATA DAN VIEWPORT - TIDAK DIIZINKAN DALAM CLIENT COMPONENT
// export const metadata = {
//   title: 'Top Up - ZeeBoost',
//   description: 'Top up Robux dengan mudah dan aman'
// };

// export const viewport = {
//   themeColor: '#3b82f6'
// };