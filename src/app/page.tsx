'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import Footer from '@/components/Footer';
import ChatCS from '@/components/ChatCS';

interface Transaction {
  id: number;
  robuxAmount: number;
  totalPrice: number;
  finalPrice?: number;
  avatarUrl?: string; // Tambahkan field ini
  method: string;
  status: string;
  createdAt: string;
  user: {
    robloxUsername: string;
    userId?: number;
  };
}

interface RobuxInventory {
  totalRobux: number;
  totalVariants: number;
  lastUpdated: string;
  status: 'available' | 'low' | 'out_of_stock';
}

const faqData = [
  {
    question: "Bagaimana cara topup Robux di ZeeBoost?",
    answer: "Sangat mudah! Pilih paket Robux, masukkan username Roblox Anda, pilih metode pembayaran, dan selesaikan transaksi. Robux akan langsung masuk ke akun Anda dalam 2-5 menit."
  },
  {
    question: "Apakah ZeeBoost aman dan terpercaya?",
    answer: "Ya, ZeeBoost 100% aman! Kami menggunakan sistem keamanan berlapis dengan enkripsi SSL. Ribuan gamer telah mempercayai kami untuk topup Robux mereka."
  },
  {
    question: "Berapa lama proses pengiriman Robux?",
    answer: "Robux biasanya masuk ke akun Anda dalam 2-5 menit setelah pembayaran berhasil. Sistem otomatis kami memastikan pengiriman yang cepat dan akurat."
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Kami menyediakan berbagai metode pembayaran seperti DANA, OVO, GoPay, Bank Transfer, dan Indomaret. Pilih yang paling nyaman untuk Anda."
  },
  {
    question: "Apakah ada customer service 24 jam?",
    answer: "Ya! Kami memiliki AI Customer Service yang siap membantu Anda 24/7. Tanyakan seputar Roblox, Robux, atau website kami kapan saja. Tim support kami juga tersedia untuk bantuan lebih lanjut."
  },
  {
    question: "Bagaimana jika Robux tidak masuk ke akun saya?",
    answer: "Jangan khawatir! Hubungi customer service kami segera dengan menyertakan bukti pembayaran dan username Roblox. Kami akan segera memproses dan memastikan Robux masuk ke akun Anda."
  }
];

export default function Home() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [robuxInventory, setRobuxInventory] = useState<RobuxInventory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fungsi untuk fetch avatar - mengikuti flow topup
  const fetchUserAvatar = async (username: string): Promise<string> => {
    try {
      console.log('Fetching avatar for username:', username);
      
      // Step 1: Validasi username untuk mendapatkan userId (sama seperti di topup)
      const validateResponse = await fetch('/api/roblox/validate-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      
      if (!validateResponse.ok) {
        throw new Error('Failed to validate username');
      }
      
      const validateData = await validateResponse.json();
      console.log('Validate response:', validateData);
      
      if (validateData.success) {
        // Step 2: Ambil thumbnail menggunakan userId (sama seperti di topup)
        const thumbnailResponse = await fetch(
          `/api/roblox/thumbnail?userId=${validateData.user.id}`
        );
        
        if (thumbnailResponse.ok) {
          const thumbnailData = await thumbnailResponse.json();
          console.log('Thumbnail response:', thumbnailData);
          
          if (thumbnailData.data && thumbnailData.data.length > 0 && thumbnailData.data[0].imageUrl) {
            return thumbnailData.data[0].imageUrl;
          }
        }
      }
      
      // Fallback ke placeholder jika gagal (sama seperti di topup)
      return `https://via.placeholder.com/48x48/10b981/ffffff?text=${username.charAt(0).toUpperCase()}`;
    } catch (error) {
      console.error('Error fetching user avatar:', error);
      return `https://via.placeholder.com/48x48/10b981/ffffff?text=${username.charAt(0).toUpperCase()}`;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch transactions
      const transactionsResponse = await fetch('/api/transactions');
      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const transactions = await transactionsResponse.json();
      console.log('Transactions data:', transactions);
      
      const recentTrans = transactions.slice(0, 5);
      
      // Ambil avatar untuk setiap transaksi menggunakan robloxUsername dari database
      const transactionsWithAvatars = await Promise.all(
        recentTrans.map(async (transaction: any) => {
          console.log('Processing transaction:', transaction);
          
          // Ambil username dari user.robloxUsername (sesuai struktur database)
          const username = transaction.user?.robloxUsername;
          
          if (username) {
            console.log('Fetching avatar for:', username);
            const avatarUrl = await fetchUserAvatar(username);
            return { ...transaction, avatarUrl };
          }
          
          // Fallback jika tidak ada username
          return {
            ...transaction,
            avatarUrl: `https://via.placeholder.com/48x48/10b981/ffffff?text=U`
          };
        })
      );
      
      console.log('Transactions with avatars:', transactionsWithAvatars);
      setRecentTransactions(transactionsWithAvatars);
      
      // Fetch robux inventory from database
      const robuxResponse = await fetch('/api/robux-stock');
      const robuxData = await robuxResponse.json();
      
      // Calculate total robux from all active variants
      const totalRobux = robuxData
        .filter((item: any) => item.isActive)
        .reduce((total: number, item: any) => total + item.amount, 0);
      
      const inventory: RobuxInventory = {
        totalRobux,
        totalVariants: robuxData.filter((item: any) => item.isActive).length,
        lastUpdated: new Date().toISOString(),
        status: totalRobux > 0 ? 'available' : 'out_of_stock'
      };
      setRobuxInventory(inventory);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-gradient-to-r from-yellow-400 to-orange-400', text: 'text-white', label: 'Pending' },
      completed: { bg: 'bg-gradient-to-r from-primary to-primary-dark', text: 'text-white', label: 'Selesai' },
      failed: { bg: 'bg-gradient-to-r from-red-400 to-pink-400', text: 'text-white', label: 'Gagal' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} shadow-lg`}>
        {config.label}
      </span>
    );
  };

  const getStockStatus = (inventory: RobuxInventory) => {
    if (inventory.totalRobux > 1000) {
      return { color: 'text-green-600', bg: 'bg-green-100', label: 'Stok Melimpah', icon: 'fas fa-check-circle' };
    } else if (inventory.totalRobux > 100) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Stok Terbatas', icon: 'fas fa-exclamation-triangle' };
    } else {
      return { color: 'text-red-600', bg: 'bg-red-100', label: 'Stok Habis', icon: 'fas fa-times-circle' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navbar />
      <Banner />
      
      <main className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-primary-100/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary-300/25 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto py-16 px-4">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <span className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full text-sm font-semibold shadow-lg">
                  Platform Topup Robux #1 di Indonesia
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary-600 bg-clip-text text-transparent mb-6">
                Topup Robux Mudah & Aman
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Dapatkan Robux untuk game Roblox favorit Anda dengan harga terjangkau, 
                proses super cepat, dan keamanan terjamin. Bergabung dengan ribuan gamer lainnya!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/topup" 
                  className="group px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full font-semibold hover:from-primary-dark hover:to-primary-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    Mulai Topup Robux
                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </span>
                </Link>
                <button className="px-8 py-4 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary-50 transition-all duration-300">
                  Lihat Harga
                </button>
              </div>
            </div>
          </section>

          {/* Stok Robux Tersedia */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                Stok Robux Tersedia
              </h2>
              <p className="text-gray-600 text-lg">Total inventory Robux yang siap untuk topup</p>
            </div>
            
            {isLoading ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-primary-100 animate-pulse">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-6"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-3 w-32 mx-auto"></div>
                    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4 w-48 mx-auto"></div>
                    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-40 mx-auto"></div>
                  </div>
                </div>
              </div>
            ) : robuxInventory ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-primary-100 hover:shadow-2xl transition-all duration-300">
                  <div className="text-center">
                    {/* Robux Icon */}
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg width="24" height="26" viewBox="0 0 27 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                        <g id="common/robux">
                          <path 
                            id="coin" 
                            fillRule="evenodd" 
                            clipRule="evenodd" 
                            d="M23.9451 5.63679C25.7431 6.66771 26.8519 8.57401 26.8519 10.6358V19.3631C26.8519 21.426 25.7431 23.3312 23.9451 24.3621L16.3315 28.7268C14.5336 29.7577 12.3172 29.7577 10.5192 28.7268L2.90559 24.3621C1.10764 23.3312 0 21.426 0 19.3631V10.6358C0 8.57401 1.10764 6.66771 2.90559 5.63679L10.5192 1.27319C12.3172 0.242272 14.5336 0.242272 16.3315 1.27319L23.9451 5.63679ZM11.5385 3.25392L4.124 7.50421C2.95594 8.17409 2.23765 9.41051 2.23765 10.7503V19.2497C2.23765 20.5884 2.95594 21.8259 4.124 22.4958L11.5385 26.745C12.7065 27.4148 14.1442 27.4148 15.3123 26.745L22.7267 22.4958C23.8948 21.8259 24.6142 20.5884 24.6142 19.2497V10.7503C24.6142 9.41051 23.8948 8.17409 22.7267 7.50421L15.3123 3.25392C14.1442 2.58405 12.7065 2.58405 11.5385 3.25392ZM14.9755 5.62902L20.8258 8.98171C21.7847 9.5316 22.3765 10.5481 22.3765 11.649V18.3555C22.3765 19.4553 21.7847 20.4717 20.8258 21.0216L14.9755 24.3754C14.0167 24.9253 12.8341 24.9253 11.8752 24.3754L6.02488 21.0216C5.06605 20.4717 4.47531 19.4553 4.47531 18.3555V11.649C4.47531 10.5481 5.06605 9.5316 6.02488 8.98171L11.8752 5.62902C12.8341 5.07912 14.0167 5.07912 14.9755 5.62902ZM10.0694 18.3344H16.7824V11.669H10.0694V18.3344Z" 
                            fill="currentColor" 
                          /> 
                        </g> 
                      </svg>
                    </div>
                    
                    {/* Stock Label and Amount */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Stok Robux</h3>
                      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary-600 bg-clip-text text-transparent mb-2">
                        {(robuxInventory.totalRobux / 1000).toFixed(1)}k+
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Link 
                      href="/topup" 
                      className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full font-semibold hover:from-primary-dark hover:to-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Beli Robux Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-primary-100">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Stok</h3>
                  <p className="text-gray-500 mb-4">Tidak dapat mengambil data stok Robux saat ini</p>
                  <button 
                    onClick={fetchDashboardData}
                    className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Recent Transactions */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                Transaksi Terbaru
              </h2>
              <p className="text-gray-600 text-lg">Lihat aktivitas terbaru dari pengguna kami</p>
            </div>
            
            {isLoading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-primary-100">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-6 border-b border-gray-100 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 w-32"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-primary-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Pengguna
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Robux
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Harga
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-primary-50/50 transition-colors duration-200">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-200 shadow-sm relative">
                                {transaction.avatarUrl && !transaction.avatarUrl.includes('placeholder') ? (
                                  <img 
                                    src={transaction.avatarUrl} 
                                    alt={`${transaction.user.robloxUsername} avatar`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-full h-full bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold text-sm absolute inset-0" 
                                  style={{display: transaction.avatarUrl && !transaction.avatarUrl.includes('placeholder') ? 'none' : 'flex'}}
                                >
                                  {transaction.user.robloxUsername.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {censorUsername(transaction.user.robloxUsername)}
                                </div>
                                {/* <div className="text-sm text-gray-500">
                                  {formatDate(transaction.createdAt)}
                                </div> */}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mr-3 shadow-lg">
                                <svg width="20" height="22" viewBox="0 0 27 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                  <g id="common/robux">
                                    <path 
                                      id="coin" 
                                      fillRule="evenodd" 
                                      clipRule="evenodd" 
                                      d="M23.9451 5.63679C25.7431 6.66771 26.8519 8.57401 26.8519 10.6358V19.3631C26.8519 21.426 25.7431 23.3312 23.9451 24.3621L16.3315 28.7268C14.5336 29.7577 12.3172 29.7577 10.5192 28.7268L2.90559 24.3621C1.10764 23.3312 0 21.426 0 19.3631V10.6358C0 8.57401 1.10764 6.66771 2.90559 5.63679L10.5192 1.27319C12.3172 0.242272 14.5336 0.242272 16.3315 1.27319L23.9451 5.63679ZM11.5385 3.25392L4.124 7.50421C2.95594 8.17409 2.23765 9.41051 2.23765 10.7503V19.2497C2.23765 20.5884 2.95594 21.8259 4.124 22.4958L11.5385 26.745C12.7065 27.4148 14.1442 27.4148 15.3123 26.745L22.7267 22.4958C23.8948 21.8259 24.6142 20.5884 24.6142 19.2497V10.7503C24.6142 9.41051 23.8948 8.17409 22.7267 7.50421L15.3123 3.25392C14.1442 2.58405 12.7065 2.58405 11.5385 3.25392ZM14.9755 5.62902L20.8258 8.98171C21.7847 9.5316 22.3765 10.5481 22.3765 11.649V18.3555C22.3765 19.4553 21.7847 20.4717 20.8258 21.0216L14.9755 24.3754C14.0167 24.9253 12.8341 24.9253 11.8752 24.3754L6.02488 21.0216C5.06605 20.4717 4.47531 19.4553 4.47531 18.3555V11.649C4.47531 10.5481 5.06605 9.5316 6.02488 8.98171L11.8752 5.62902C12.8341 5.07912 14.0167 5.07912 14.9755 5.62902ZM10.0694 18.3344H16.7824V11.669H10.0694V18.3344Z" 
                                      fill="currentColor" 
                                    /> 
                                  </g> 
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {transaction.robuxAmount.toLocaleString()} Robux
                                </div>
                                <div className="text-xs text-gray-500">
                                  {transaction.method}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
              Rp {(transaction.finalPrice || transaction.totalPrice).toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            {getStatusBadge(transaction.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-primary-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-receipt text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Transaksi</h3>
                <p className="text-gray-500 mb-6">Belum ada transaksi yang tercatat dalam sistem</p>
                <Link 
                  href="/topup" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full font-semibold hover:from-primary-dark hover:to-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Mulai Topup Robux
                </Link>
              </div>
            )}
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                Pertanyaan yang Sering Ditanyakan
              </h2>
              <p className="text-gray-600 text-lg">Temukan jawaban untuk pertanyaan umum seputar ZeeBoost</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary-100 overflow-hidden">
                    <button
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-primary-50/50 transition-colors duration-200"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      <i className={`fas fa-chevron-down transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}></i>
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
      <ChatCS />
    </div>
  );
}

// Fungsi untuk menyensor username dengan menampilkan huruf pertama dan terakhir saja. Berikut adalah perubahan yang diperlukan:
const censorUsername = (username: string): string => {
  if (!username || username.length <= 2) {
    return username;
  }
  
  const firstChar = username.charAt(0);
  const lastChar = username.charAt(username.length - 1);
  const middleLength = username.length - 2;
  const stars = '*'.repeat(middleLength);
  
  return `${firstChar}${stars}${lastChar}`;
};