'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types/admin';

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export default function TransactionList({ transactions, onRefresh }: TransactionListProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'pending_failed' | 'paid' | 'success'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fungsi untuk mengekstrak gamepass ID dari transaction
  const extractGamepassId = (transaction: Transaction): string | null => {
    if (transaction.gamepassId) {
      return transaction.gamepassId;
    }
    if (transaction.gamepassUrl) {
      const match = transaction.gamepassUrl.match(/game-pass\/(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  // Fungsi untuk membuat link gamepass
  const createGamepassLink = (transaction: Transaction): string | null => {
    const gamepassId = extractGamepassId(transaction);
    return gamepassId ? `https://www.roblox.com/game-pass/${gamepassId}` : null;
  };

  // Filter dan search transaksi
  const filteredAndSearchedTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter berdasarkan status
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending_failed') {
        filtered = filtered.filter(t => ['pending', 'failed'].includes(t.status));
      } else {
        filtered = filtered.filter(t => t.status === filterStatus);
      }
    }

    // Search berdasarkan username, email, atau ID
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.user.robloxUsername.toLowerCase().includes(term) ||
        t.user.email.toLowerCase().includes(term) ||
        t.id.toString().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.robuxAmount - b.robuxAmount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filterStatus, searchTerm, sortBy, sortOrder]);

  // Handle select individual transaction
  const handleSelectTransaction = (transactionId: number) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  // Handle select all visible transactions
  const handleSelectAll = () => {
    const visibleIds = filteredAndSearchedTransactions
      .filter(t => ['pending', 'failed'].includes(t.status))
      .map(t => t.id);
    
    if (selectedTransactions.length === visibleIds.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(visibleIds);
    }
  };

  // Handle delete selected transactions
  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) {
      alert('Pilih transaksi yang ingin dihapus');
      return;
    }

    const confirmMessage = `Yakin ingin menghapus ${selectedTransactions.length} transaksi? Aksi ini tidak dapat dibatalkan.`;
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/transactions/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          transactionIds: selectedTransactions,
          deleteType: filterStatus === 'all' ? 'pending_failed' : filterStatus
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        setSelectedTransactions([]);
        onRefresh();
      } else {
        alert(result.error || 'Gagal menghapus transaksi');
      }
    } catch (error) {
      console.error('Error deleting transactions:', error);
      alert('Terjadi kesalahan saat menghapus transaksi');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle auto cleanup old transactions
  const handleAutoCleanup = async () => {
    const confirmMessage = 'Hapus semua transaksi pending/failed yang lebih dari 2 hari?';
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/transactions/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          days: 2,
          status: ['pending', 'failed']
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        onRefresh();
      } else {
        alert(result.error || 'Gagal menghapus transaksi lama');
      }
    } catch (error) {
      console.error('Error auto-cleaning transactions:', error);
      alert('Terjadi kesalahan saat menghapus transaksi lama');
    } finally {
      setIsDeleting(false);
    }
  };

  const deletableTransactions = filteredAndSearchedTransactions.filter(t => ['pending', 'failed'].includes(t.status));

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header dengan kontrol */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Daftar Transaksi</h3>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari berdasarkan username, email, atau ID transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter dan Sort Controls */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setSelectedTransactions([]);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending - Belum bayar</option>
              <option value="processing">Processing - Sudah berhasil bayar</option>
              <option value="completed">Completed - Sudah selesai/success</option>
              <option value="failed">Failed - Gagal</option>
              <option value="pending_failed">Pending & Failed</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="date">Urutkan: Tanggal</option>
              <option value="amount">Urutkan: Jumlah Robux</option>
              <option value="status">Urutkan: Status</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>

            {/* Tombol Auto Cleanup */}
            <button
              onClick={handleAutoCleanup}
              disabled={isDeleting}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Otomatis (>2 hari)'}
            </button>

            {/* Tombol Hapus Terpilih */}
            {selectedTransactions.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isDeleting ? 'Menghapus...' : `Hapus Terpilih (${selectedTransactions.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Info dan Select All */}
        {deletableTransactions.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {deletableTransactions.length} transaksi dapat dihapus dari {filteredAndSearchedTransactions.length} hasil
            </p>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTransactions.length === deletableTransactions.length && deletableTransactions.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Pilih Semua</span>
            </label>
          </div>
        )}
      </div>

      {/* Tabel Transaksi */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pilih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Robux & Harga
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link Gamepass
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSearchedTransactions.map((transaction) => {
              const canDelete = ['pending', 'failed'].includes(transaction.status);
              const isSelected = selectedTransactions.includes(transaction.id);
              const gamepassLink = createGamepassLink(transaction);
              
              return (
                <tr key={transaction.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canDelete && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.user.robloxUsername}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    <div className="text-primary-600">
                      {transaction.robuxAmount.toLocaleString()} R$
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.finalPrice ? (
                        <>
                          <span className="line-through">
                            Rp {(transaction.robuxStock?.price || transaction.totalPrice).toLocaleString()}
                          </span>
                          <span className="ml-2 text-green-600">Rp {transaction.finalPrice.toLocaleString()}</span>
                        </>
                      ) : (
                        <span>Rp {transaction.totalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.method === 'gamepass' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {transaction.method === 'gamepass' ? 'Gamepass' : 'Login'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {gamepassLink ? (
                      <a
                        href={gamepassLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Lihat Gamepass
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status === 'completed' ? 'Selesai' :
                       transaction.status === 'pending' ? 'Pending' : 'Gagal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                    </div>
                    <div className="text-xs">
                      {new Date(transaction.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSearchedTransactions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          {searchTerm || filterStatus !== 'all' ? 'Tidak ada transaksi yang sesuai dengan filter' : 'Tidak ada transaksi ditemukan'}
        </div>
      )}
    </div>
  );
}