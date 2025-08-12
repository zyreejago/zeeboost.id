'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types/admin';

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export default function TransactionList({ transactions, onRefresh }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
  
  // Fungsi untuk membuka modal detail
  const openDetailModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  // Fungsi untuk menutup modal detail
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTransaction(null);
  };

  const updateTransactionStatus = async (transactionId: number, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('/api/admin/transactions/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
          // Hapus Authorization header karena menggunakan HTTP-only cookie
        },
        body: JSON.stringify({
          transactionId,
          status: newStatus
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        onRefresh();
        if (selectedTransaction && selectedTransaction.id === transactionId) {
          setSelectedTransaction(result.transaction);
        }
      } else {
        alert(result.error || 'Gagal mengupdate status transaksi');
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      alert('Terjadi kesalahan saat mengupdate status transaksi');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Fungsi untuk parse backup codes
  const parseBackupCodes = (backupCodesJson: string): string[] => {
    try {
      return JSON.parse(backupCodesJson);
    } catch {
      return [];
    }
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
        (t.user.email && t.user.email.toLowerCase().includes(term)) ||
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
      // Tentukan deleteType berdasarkan status transaksi yang dipilih
      const selectedStatuses = transactions
        .filter(t => selectedTransactions.includes(t.id))
        .map(t => t.status);

      const deleteType =
        selectedStatuses.every(s => s === 'pending') ? 'pending' :
        selectedStatuses.every(s => s === 'failed') ? 'failed' :
        'pending_failed';

      const response = await fetch('/api/admin/transactions/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
          // Hapus Authorization header
        },
        body: JSON.stringify({
          transactionIds: selectedTransactions,
          deleteType: deleteType
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
          'Content-Type': 'application/json'
          // Hapus Authorization header
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                      {transaction.user.email || '-'}
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
                    {/* Ubah bagian ini untuk menambahkan tombol detail untuk gamepass juga */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openDetailModal(transaction)}
                        className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <i className="fas fa-info-circle mr-1"></i>
                        Detail
                      </button>
                      {transaction.method === 'gamepass' && gamepassLink && (
                        <a
                          href={gamepassLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors"
                        >
                          <i className="fas fa-external-link-alt mr-1"></i>
                          Gamepass
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Tambahkan dropdown untuk update status */}
                    <div className="flex items-center space-x-2">
                    
                      <select
                        value={transaction.status}
                        onChange={(e) => updateTransactionStatus(transaction.id, e.target.value)}
                        disabled={isUpdatingStatus}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Selesai</option>
                        <option value="failed">Gagal</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      transaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status === 'completed' ? 'Selesai' :
                       transaction.status === 'pending' ? 'Pending' :
                       transaction.status === 'processing' ? 'Sedang Diproses' : 'Gagal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
      
      {/* Modal Detail Via Login */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header Modal */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Detail Transaksi {selectedTransaction.method === 'gamepass' ? 'Gamepass' : 'Via Login'} #{selectedTransaction.id}
                </h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              {/* Content Modal */}
              <div className="space-y-6">
                {/* Informasi User */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-user mr-2 text-blue-500"></i>
                    Informasi Akun
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username Roblox</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                        {selectedTransaction.user.robloxUsername}
                      </p>
                    </div>
                    {/* Tampilkan password hanya untuk Via Login */}
                    {selectedTransaction.method === 'vialogin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                          {selectedTransaction.robloxPassword || 'Tidak tersedia'}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedTransaction.user.whatsappNumber ? (
                          <a 
                            href={`https://wa.me/${selectedTransaction.user.whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 flex items-center"
                          >
                            <i className="fab fa-whatsapp mr-2"></i>
                            +{selectedTransaction.user.whatsappNumber}
                          </a>
                        ) : (
                          'Tidak tersedia'
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedTransaction.user.email || 'Tidak tersedia'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Informasi Robux */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-coins mr-2 text-yellow-500"></i>
                    Informasi Robux
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jumlah Robux</label>
                      <p className="mt-1 text-lg font-bold text-blue-600">
                        {selectedTransaction.robuxAmount.toLocaleString()} R$
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Metode</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {selectedTransaction.method === 'gamepass' ? 'Gamepass' : 'Via Login'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Harga</label>
                      <p className="mt-1 text-lg font-bold text-green-600">
                        Rp {(selectedTransaction.finalPrice || selectedTransaction.totalPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Informasi Gamepass - hanya untuk transaksi gamepass */}
                {selectedTransaction.method === 'gamepass' && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-gamepad mr-2 text-green-500"></i>
                      Informasi Gamepass
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {extractGamepassId(selectedTransaction) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gamepass ID</label>
                          <p className="mt-1 text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                            {extractGamepassId(selectedTransaction)}
                          </p>
                        </div>
                      )}
                      {createGamepassLink(selectedTransaction) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Link Gamepass</label>
                          <div className="mt-1">
                            <a
                              href={createGamepassLink(selectedTransaction)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <i className="fas fa-external-link-alt mr-2"></i>
                              Buka Gamepass
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Verifikasi 2FA - hanya untuk Via Login */}
                {selectedTransaction.method === 'vialogin' && selectedTransaction.isAliveVerification && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="fas fa-shield-alt mr-2 text-orange-500"></i>
                      Verifikasi 2FA Aktif
                    </h4>
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-orange-700">
                        <i className="fas fa-check-circle mr-2"></i>
                        Akun menggunakan verifikasi hidup (2FA)
                      </div>
                    </div>
                    
                    {selectedTransaction.backupCodes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Codes</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {parseBackupCodes(selectedTransaction.backupCodes).map((code, index) => (
                            <div key={index} className="bg-white px-3 py-2 rounded border font-mono text-sm">
                              {code || 'N/A'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Status Transaksi dengan Update */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <i className="fas fa-info-circle mr-2 text-gray-500"></i>
                    Status Transaksi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status Saat Ini</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedTransaction.status === 'completed' ? 'Selesai' :
                         selectedTransaction.status === 'pending' ? 'Pending' : 'Gagal'}
                      </span>
                      
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                        <select
                          value={selectedTransaction.status}
                          onChange={(e) => updateTransactionStatus(selectedTransaction.id, e.target.value)}
                          disabled={isUpdatingStatus}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Selesai</option>
                          <option value="failed">Gagal</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedTransaction.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Modal */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}