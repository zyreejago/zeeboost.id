'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Transaction {
  id: number;
  robuxAmount: number;
  // totalPrice: number;
  // finalPrice?: number;
  method: string;
  status: string;
  createdAt: string;
  paymentProof?: string;
  user: {
    robloxUsername: string;
  };
}

interface CheckOrderResponse {
  success: boolean;
  transactions: Transaction[];
  total: number;
}

export default function CheckOrderPage() {
  const [username, setUsername] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Silakan masukkan username Roblox');
      return;
    }

    setIsLoading(true);
    setError('');
    setTransactions([]);
    setHasSearched(false);

    try {
      const response = await fetch('/api/transactions/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ robloxUsername: username.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactions(data.transactions);
        setHasSearched(true);
      } else {
        setError(data.error || 'Terjadi kesalahan saat mengecek pesanan');
        setHasSearched(true);
      }
    } catch (_error) {
      console.error('Error checking order:', error);
      setError('Terjadi kesalahan koneksi');
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu Pembayaran' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Sedang Diproses' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Selesai' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Gagal' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Dibatalkan' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const _formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cek Status Pesanan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Masukkan username Roblox Anda untuk melihat status pesanan topup Robux
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username Roblox
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Roblox"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-dark text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Mencari...
                </div>
              ) : (
                'Cek Pesanan'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {hasSearched && transactions.length === 0 && !error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Tidak Ada Pesanan</h3>
              <p className="text-yellow-700 mb-4">
                Tidak ditemukan pesanan untuk username <strong>{username}</strong>
              </p>
              <Link 
                href="/topup" 
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Buat Pesanan Baru
              </Link>
            </div>
          </div>
        )}

        {/* Results */}
        {transactions.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Pesanan untuk: <span className="text-blue-600">{username}</span>
              </h2>
              <p className="text-gray-600">
                Ditemukan {transactions.length} pesanan
              </p>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Pesanan #{transaction.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Jumlah Robux</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {transaction.robuxAmount.toLocaleString()} Robux
                      </p>
                    </div>
                    
                    {/* <div>
                      <p className="text-sm text-gray-500 mb-1">Total Harga</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {transaction.finalPrice ? 
                          formatPrice(transaction.finalPrice) : 
                          formatPrice(transaction.totalPrice)
                        }
                      </p>
                    </div> */}
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Metode</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {transaction.method === 'gamepass' ? 'Gamepass' : 'Login'}
                      </p>
                    </div>
                  </div>

                  {transaction.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Menunggu Pembayaran:</strong> Silakan lakukan pembayaran sesuai instruksi yang diberikan.
                      </p>
                    </div>
                  )}

                  {transaction.status === 'processing' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Sedang Diproses:</strong> Pesanan Anda sedang diproses. Robux akan segera masuk ke akun Anda.
                      </p>
                    </div>
                  )}

                  {transaction.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Selesai:</strong> Robux telah berhasil masuk ke akun Roblox Anda.
                      </p>
                    </div>
                  )}

                  {transaction.status === 'failed' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Gagal:</strong> Terjadi masalah dengan pesanan ini. Silakan hubungi customer service.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 text-center space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <Link 
                href="/topup" 
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Buat Pesanan Baru
              </Link>
              
              <button 
                onClick={() => {
                  setUsername('');
                  setTransactions([]);
                  setError('');
                  setHasSearched(false);
                }}
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cari Username Lain
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}