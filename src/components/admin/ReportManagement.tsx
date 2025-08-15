'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '@/types/admin';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportManagementProps {
  transactions: Transaction[];
}

export default function ReportManagement({ transactions }: ReportManagementProps) {
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter transaksi berdasarkan kriteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      // Set waktu ke awal hari untuk perbandingan yang akurat
      transactionDate.setHours(0, 0, 0, 0);
      
      const startDate = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
      const endDate = dateFilter.endDate ? new Date(dateFilter.endDate) : null;
      
      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }

      // Filter tanggal
      if (startDate && transactionDate < startDate) return false;
      if (endDate && transactionDate > endDate) return false;

      // Filter status (hapus mapping yang tidak diperlukan)
      if (statusFilter !== 'all') {
        if (transaction.status !== statusFilter) {
          return false;
        }
      }

      // Filter metode pembayaran
      if (methodFilter !== 'all' && transaction.method !== methodFilter) return false;

      // Filter pencarian
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.user.robloxUsername.toLowerCase().includes(searchLower) ||
          transaction.user.email?.toLowerCase().includes(searchLower) ||
          transaction.id.toString().includes(searchLower)
        );
      }

      return true;
    });
  }, [transactions, dateFilter, statusFilter, methodFilter, searchTerm]);

  // Statistik laporan
  const reportStats = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const completedTransactions = filteredTransactions.filter(t => t.status === 'completed').length;
    const totalRevenue = filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.finalPrice || t.totalPrice), 0);
    const totalRobux = filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.robuxAmount, 0);

    return {
      totalTransactions,
      completedTransactions,
      totalRevenue,
      totalRobux
    };
  }, [filteredTransactions]);

  // Fungsi untuk mengekstrak gamepass ID dari transaction
  const extractGamepassId = (transaction: Transaction): string | null => {
    // Jika ada gamepassId langsung dari database, gunakan itu
    if (transaction.gamepassId) {
      return transaction.gamepassId;
    }
    
    // Fallback: ekstrak dari gamepassUrl jika ada
    if (transaction.gamepassUrl) {
      const match = transaction.gamepassUrl.match(/game-pass\/(\d+)/);
      return match ? match[1] : null;
    }
    
    return null;
  };

  // Fungsi untuk membuat link gamepass
  const createGamepassLink = (transaction: Transaction): string | null => {
    const _gamepassId = extractGamepassId(transaction);
    return _gamepassId ? `https://www.roblox.com/id/game-pass/${_gamepassId}` : null;
  };

  // Export ke Excel
  const exportToExcel = () => {
    const exportData = filteredTransactions.map(transaction => {
      const _gamepassId = extractGamepassId(transaction);
      const gamepassLink = createGamepassLink(transaction);
      return {
        'ID Transaksi': transaction.id,
        'Username Roblox': transaction.user.robloxUsername,
        'Email': transaction.user.email || '-',
        'WhatsApp': transaction.user.whatsappNumber || '-',
        'Jumlah Robux': transaction.robuxAmount,
        'Harga Total': transaction.totalPrice,
        'Harga Final': transaction.finalPrice || transaction.totalPrice,
        'Metode Pembayaran': transaction.method,
        'Status': transaction.status,
        'Kode Kupon': transaction.couponCode || '-',
        'Diskon': transaction.discount || 0,
        'Gamepass ID': gamepassId || '-',
        'Link Gamepass': gamepassLink || '-',
        'Tanggal': new Date(transaction.createdAt).toLocaleDateString('id-ID'),
        'Waktu': new Date(transaction.createdAt).toLocaleTimeString('id-ID')
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Transaksi');
    
    const fileName = `laporan-transaksi-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export ke PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape'); // Ubah ke landscape untuk lebih banyak kolom
    
    // Header
    doc.setFontSize(18);
    doc.text('Laporan Transaksi ZeeBoost', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Periode: ${dateFilter.startDate || 'Semua'} - ${dateFilter.endDate || 'Semua'}`, 14, 32);
    doc.text(`Total Transaksi: ${reportStats.totalTransactions}`, 14, 42);
    doc.text(`Transaksi Selesai: ${reportStats.completedTransactions}`, 14, 52);
    doc.text(`Total Pendapatan: Rp ${reportStats.totalRevenue.toLocaleString()}`, 14, 62);
    
    // Tabel data dengan field yang sama seperti Excel
    const tableData = filteredTransactions.map(transaction => {
      const _gamepassId = extractGamepassId(transaction);
      const gamepassLink = createGamepassLink(transaction);
      return [
        transaction.id,
        transaction.user.robloxUsername,
        transaction.user.email || '-',
        transaction.user.whatsappNumber || '-',
        transaction.robuxAmount.toLocaleString(),
        `Rp ${transaction.totalPrice.toLocaleString()}`,
        `Rp ${(transaction.finalPrice || transaction.totalPrice).toLocaleString()}`,
        transaction.method,
        transaction.status,
        transaction.couponCode || '-',
        transaction.discount || 0,
        gamepassLink || '-', // Gunakan link, bukan hanya ID
        new Date(transaction.createdAt).toLocaleDateString('id-ID')
      ];
    });

    autoTable(doc, {
      head: [[
        'ID', 
        'Username', 
        'Email', 
        'WhatsApp', 
        'Robux', 
        'Harga Total', 
        'Harga Final', 
        'Metode', 
        'Status', 
        'Kode Kupon', 
        'Diskon', 
        'Link Gamepass', 
        'Tanggal'
      ]],
      body: tableData,
      startY: 75,
      styles: { fontSize: 7 }, // Perkecil font untuk muat semua kolom
      headStyles: { fillColor: [155, 39, 227] },
      columnStyles: {
        11: { cellWidth: 40 } // Lebar khusus untuk kolom link gamepass
      }
    });
    
    const fileName = `laporan-transaksi-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Reset filter
  const resetFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setStatusFilter('all');
    setMethodFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-chart-bar mr-3 text-primary-600"></i>
              Laporan Transaksi
            </h2>
            <p className="text-gray-600 mt-1">Kelola dan export laporan transaksi</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <i className="fas fa-file-excel mr-2"></i>
              Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Export PDF
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending - Belum bayar</option>
              <option value="processing">Processing - Sudah berhasil bayar</option>
              <option value="completed">Completed - Sudah selesai/success</option>
              <option value="failed">Failed - Gagal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Semua Metode</option>
              <option value="gamepass">Gamepass</option>
              <option value="login">Login</option>
            </select>
          </div>
        </div>

        {/* Search and Reset */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari berdasarkan username, email, atau ID transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            <i className="fas fa-undo mr-2"></i>
            Reset Filter
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <i className="fas fa-list text-blue-600 text-xl mr-3"></i>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Transaksi</p>
                <p className="text-2xl font-bold text-blue-800">{reportStats.totalTransactions}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-600 text-xl mr-3"></i>
              <div>
                <p className="text-sm text-green-600 font-medium">Transaksi Selesai</p>
                <p className="text-2xl font-bold text-green-800">{reportStats.completedTransactions}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <i className="fas fa-money-bill text-purple-600 text-xl mr-3"></i>
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Pendapatan</p>
                <p className="text-2xl font-bold text-purple-800">Rp {reportStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <i className="fas fa-coins text-yellow-600 text-xl mr-3"></i>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Total Robux</p>
                <p className="text-2xl font-bold text-yellow-800">{reportStats.totalRobux.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h3 className="text-lg font-semibold text-primary-800 flex items-center">
            <i className="fas fa-table mr-3"></i>
            Data Transaksi ({filteredTransactions.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Robux
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link Gamepass
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.user.robloxUsername}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.robuxAmount.toLocaleString()} R$
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {transaction.finalPrice ? (
                          <>
                            <span className="line-through text-gray-500">Rp {transaction.totalPrice.toLocaleString()}</span>
                            <br />
                            <span className="text-green-600 font-medium">Rp {transaction.finalPrice.toLocaleString()}</span>
                          </>
                        ) : (
                          `Rp ${transaction.totalPrice.toLocaleString()}`
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.method}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        const gamepassLink = createGamepassLink(transaction);
                        return gamepassLink ? (
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
                        );
                      })()
                    }</td>
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
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <i className="fas fa-search text-4xl"></i>
            </div>
            <p className="text-gray-500">Tidak ada transaksi yang sesuai dengan filter</p>
          </div>
        )}
      </div>
    </div>
  );
}