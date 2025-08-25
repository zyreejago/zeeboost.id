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
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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
    } catch (_error) {
      console.error('Error updating transaction status:', _error);
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSearchedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Current transactions for the page
  const currentTransactions = filteredAndSearchedTransactions.slice(startIndex, endIndex);

  // Handle select individual transaction
  const handleSelectTransaction = (transactionId: number) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  // Handle select all visible transactions (update untuk pagination)
  const handleSelectAll = () => {
    const visibleIds = currentTransactions
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
    } catch (_error) {
      console.error('Error deleting transactions:', _error);
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
    } catch (_error) {
      console.error('Error auto-cleaning transactions:', _error);
      alert('Terjadi kesalahan saat menghapus transaksi lama');
    } finally {
      setIsDeleting(false);
    }
  };

  const deletableTransactions = currentTransactions.filter(t => ['pending', 'failed'].includes(t.status));

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
          
          {/* Pagination Info */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredAndSearchedTransactions.length)} dari {filteredAndSearchedTransactions.length} transaksi
            </span>
            <span>Halaman {currentPage} dari {totalPages}</span>
          </div>
        </div>

        {/* Info dan Select All */}
        {deletableTransactions.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {deletableTransactions.length} transaksi dapat dihapus dari {currentTransactions.length} hasil halaman ini
            </p>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTransactions.length === deletableTransactions.length && deletableTransactions.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Pilih Semua (Halaman Ini)</span>
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
            {currentTransactions.map((transaction) => {
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
                    <div className="flex items-center space-x-2">
                      <select
                        value={transaction.status}
                        onChange={(e) => updateTransactionStatus(transaction.id, e.target.value)}
                        disabled={isUpdatingStatus}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Sedang Diproses</option>
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

      {currentTransactions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          {searchTerm || filterStatus !== 'all' ? 'Tidak ada transaksi yang sesuai dengan filter' : 'Tidak ada transaksi ditemukan'}
        </div>
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm border rounded ${
                  currentPage === page 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Modal Detail */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Transaksi #{selectedTransaction.id}
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 space-y-6">
              {/* Informasi User */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informasi User */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Informasi User</h4>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Username Roblox:</span>
                    <p className="text-sm text-gray-900 font-medium">{selectedTransaction.user.robloxUsername}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-sm text-gray-900">{selectedTransaction.user.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">WhatsApp:</span>
                    <p className="text-sm text-gray-900">{selectedTransaction.user.whatsappNumber || '-'}</p>
                  </div>
                  
                  {/* Informasi Login */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="text-md font-semibold text-yellow-800 mb-3">Informasi Login User</h5>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-yellow-700">Password Roblox:</span>
                        <p className="text-sm text-gray-900 font-mono bg-white p-2 rounded border">
                          {selectedTransaction.robloxPassword || 'Tidak tersedia'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-yellow-700">Backup Codes:</span>
                        {selectedTransaction.backupCodes ? (
                          <div className="bg-white p-2 rounded border">
                            {parseBackupCodes(selectedTransaction.backupCodes).map((code, index) => (
                              <div key={index} className="text-sm font-mono text-gray-900">
                                {index + 1}. {code}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Tidak ada backup codes</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informasi Transaksi */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Informasi Transaksi</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Jumlah Robux:</span>
                      <p className="text-sm text-gray-900 font-semibold text-primary-600">
                        {selectedTransaction.robuxAmount.toLocaleString()} R$
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Harga Total:</span>
                      <p className="text-sm text-gray-900">
                        {selectedTransaction.finalPrice ? (
                          <>
                            <span className="line-through text-gray-400">
                              Rp {(selectedTransaction.robuxStock?.price || selectedTransaction.totalPrice).toLocaleString()}
                            </span>
                            <span className="ml-2 text-green-600 font-semibold">
                              Rp {selectedTransaction.finalPrice.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span>Rp {selectedTransaction.totalPrice.toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Metode:</span>
                      <p className="text-sm text-gray-900 capitalize">{selectedTransaction.method}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedTransaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedTransaction.status === 'completed' ? 'Selesai' :
                         selectedTransaction.status === 'pending' ? 'Pending' :
                         selectedTransaction.status === 'processing' ? 'Sedang Diproses' : 'Gagal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Gamepass */}
              {selectedTransaction.method === 'gamepass' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Informasi Gamepass</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Gamepass ID:</span>
                      <p className="text-sm text-gray-900">{extractGamepassId(selectedTransaction) || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">URL Gamepass:</span>
                      <p className="text-sm text-gray-900 break-all">
                        {selectedTransaction.gamepassUrl || '-'}
                      </p>
                    </div>
                    {createGamepassLink(selectedTransaction) && (
                      <div className="md:col-span-2">
                        <a
                          href={createGamepassLink(selectedTransaction)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors"
                        >
                          <i className="fas fa-external-link-alt mr-2"></i>
                          Buka Gamepass di Roblox
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Backup Codes */}
              {selectedTransaction.backupCodes && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Backup Codes</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {parseBackupCodes(selectedTransaction.backupCodes).map((code, index) => (
                        <div key={index} className="bg-white p-2 rounded border text-center font-mono text-sm">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Informasi Waktu */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Informasi Waktu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Dibuat:</span>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedTransaction.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Diperbarui:</span>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedTransaction.updatedAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Update Status</h4>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedTransaction.status}
                    onChange={(e) => updateTransactionStatus(selectedTransaction.id, e.target.value)}
                    disabled={isUpdatingStatus}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Sedang Diproses</option>
                    <option value="completed">Selesai</option>
                    <option value="failed">Gagal</option>
                  </select>
                  {isUpdatingStatus && (
                    <div className="text-sm text-gray-500">Mengupdate...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeDetailModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}