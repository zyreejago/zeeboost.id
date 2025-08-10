import React from 'react';
import { Transaction } from '@/types/admin';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
        <h2 className="text-xl font-semibold text-primary-800 flex items-center">
          <i className="fas fa-credit-card mr-3"></i>
          Daftar Transaksi
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username Roblox
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nomor WhatsApp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Robux
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link Gamepass
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium text-primary-600">
                    {transaction.user.robloxUsername}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: #{transaction.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.user.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.user.whatsappNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  <div className="text-primary-600">
                    {transaction.robuxAmount.toLocaleString()} R$
                  </div>
                  <div className="text-xs text-gray-500">
                    {transaction.finalPrice ? (
                      <>
                        <span className="line-through">Rp {transaction.totalPrice.toLocaleString()}</span>
                        <span className="ml-2 text-green-600">Rp {transaction.finalPrice.toLocaleString()}</span>
                      </>
                    ) : (
                      `Rp ${transaction.totalPrice.toLocaleString()}`
                    )}
                  </div>
                  {transaction.couponCode && (
                    <div className="text-xs text-green-600">
                      Kupon: {transaction.couponCode}
                    </div>
                  )}
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
                  {transaction.gamepassUrl ? (
                    <a
                      href={transaction.gamepassUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      <i className="fas fa-external-link-alt mr-1 text-xs"></i>
                      Buka Gamepass
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">Belum tersedia</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <i className="fas fa-inbox text-4xl"></i>
          </div>
          <p className="text-gray-500">Belum ada transaksi</p>
        </div>
      )}
    </div>
  );
}