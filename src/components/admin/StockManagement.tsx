import React, { useState } from 'react';
import { RobuxStock } from '@/types/admin';

interface StockManagementProps {
  robuxStock: RobuxStock[];
  onRefresh: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function StockManagement({ 
  robuxStock, 
  onRefresh, 
  isLoading, 
  setIsLoading 
}: StockManagementProps) {
  const [stockForm, setStockForm] = useState({
    amount: 100,
    price: 13500,
    isActive: true,
    allowOrders: true, // field baru
  });
  const [editingStock, setEditingStock] = useState<RobuxStock | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      
      if (isEditing && editingStock) {
        // Update existing stock
        response = await fetch(`/api/admin/robux-stock/${editingStock.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockForm),
        });
      } else {
        // Create new stock
        response = await fetch('/api/admin/robux-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockForm),
        });
      }

      if (response.ok) {
        setStockForm({ amount: 100, price: 13500, isActive: true, allowOrders: true }); // Fix: tambahkan allowOrders
        setEditingStock(null);
        setIsEditing(false);
        onRefresh();
        alert(isEditing ? 'Stock berhasil diupdate!' : 'Stock berhasil ditambahkan!');
      } else {
        alert('Gagal menyimpan stock!');
      }
    } catch (error) {
      alert('Gagal menyimpan stock!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStock = (stock: RobuxStock) => {
    setStockForm({
      amount: stock.amount,
      price: stock.price,
      isActive: stock.isActive,
      allowOrders: stock.allowOrders ?? true // Tambahkan fallback
    });
    setEditingStock(stock);
    setIsEditing(true);
  };

  const handleDeleteStock = async (stockId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus stock ini?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/robux-stock/${stockId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onRefresh();
        alert('Stock berhasil dihapus!');
      } else {
        alert('Gagal menghapus stock!');
      }
    } catch (error) {
      alert('Gagal menghapus stock!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setStockForm({ amount: 100, price: 13500, isActive: true, allowOrders: true }); // Fix: tambahkan allowOrders
    setEditingStock(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Add/Update Stock Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus-circle'} mr-3 text-primary-600`}></i>
          {isEditing ? 'Edit Stock Robux' : 'Tambah Stock Robux Baru'}
        </h3>
        
        {isEditing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              Sedang mengedit stock: {editingStock?.amount.toLocaleString()} R$ - Rp {editingStock?.price.toLocaleString()}
            </p>
          </div>
        )}
        
        <form onSubmit={handleStockSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Robux
            </label>
            <input
              type="number"
              value={stockForm.amount}
              onChange={(e) => setStockForm({ ...stockForm, amount: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga per 100 Robux (Rp)
            </label>
            <input
              type="number"
              value={stockForm.price}
              onChange={(e) => setStockForm({ ...stockForm, price: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={stockForm.isActive.toString()}
              onChange={(e) => setStockForm({ ...stockForm, isActive: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
          
          {/* Field baru untuk Allow Orders */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Izinkan Order
            </label>
            <select
              value={stockForm.allowOrders.toString()}
              onChange={(e) => setStockForm({ ...stockForm, allowOrders: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="true">Ya</option>
              <option value="false">Tidak (Restock)</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                  {isEditing ? 'Update' : 'Tambah'}
                </>
              )}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                <i className="fas fa-times mr-2"></i>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Stock List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h3 className="text-lg font-medium text-primary-800 flex items-center">
            <i className="fas fa-list mr-3"></i>
            Daftar Stock Robux ({robuxStock.length} item)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Robux
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga per 100 R$
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {robuxStock.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-2 block"></i>
                    Belum ada stock Robux
                  </td>
                </tr>
              ) : (
                robuxStock.map((stock) => (
                  <tr key={stock.id} className={`hover:bg-gray-50 transition-colors ${editingStock?.id === stock.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                      {stock.amount.toLocaleString()} R$
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      Rp {stock.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stock.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {stock.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stock.allowOrders ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {stock.allowOrders ? 'Bisa Order' : 'Sedang Restock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditStock(stock)}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        disabled={isLoading}
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStock(stock.id)}
                        className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        disabled={isLoading}
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}