'use client';

import { useState, useEffect } from 'react';

interface RobuxTheme {
  id: number;
  name: string;
  description?: string;
  robuxAmount: number;
  price: number;
  themeType: string;
  isPremium: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function RobuxThemesManagement() {
  const [themes, setThemes] = useState<RobuxTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState<RobuxTheme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    robuxAmount: 0,
    price: 0,
    themeType: 'theme1',
    isPremium: false,
    order: 0
  });
  
  // Tambahkan state untuk pengaturan canOrder
  const [canOrder, setCanOrder] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  useEffect(() => {
    fetchThemes();
    fetchSettings();
  }, []);

  // Tambahkan fungsi untuk mengambil pengaturan
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.canOrder !== undefined) {
        setCanOrder(data.canOrder === 'true');
      }
    } catch (_error) {
      console._error('Error fetching settings:', error);
    }
  };

  // Tambahkan fungsi untuk mengupdate pengaturan canOrder
  const updateCanOrder = async (value: boolean) => {
    setUpdatingSettings(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'canOrder',
          value: value.toString(),
          description: 'Mengizinkan pemesanan via login'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setCanOrder(value);
        alert(value ? 'Pesanan via login diaktifkan!' : 'Pesanan via login dinonaktifkan!');
      } else {
        alert('Gagal mengupdate pengaturan: ' + (data.error || 'Terjadi kesalahan'));
      }
    } catch (_error) {
      console._error('Error updating settings:', error);
      alert('Gagal mengupdate pengaturan');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/admin/robux-themes');
      const data = await response.json();
      
      if (data.success) {
        setThemes(data.themes);
      } else {
        console.error('Error fetching themes:', data.message);
      }
    } catch (_error) {
      console._error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingTheme ? 'PUT' : 'POST';
      const payload = editingTheme 
        ? { ...formData, id: editingTheme.id }
        : formData;

      const response = await fetch('/api/admin/robux-themes', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(editingTheme ? 'Tema berhasil diupdate!' : 'Tema berhasil dibuat!');
        setShowModal(false);
        setEditingTheme(null);
        resetForm();
        fetchThemes();
      } else {
        alert('Gagal menyimpan tema: ' + data.message);
      }
    } catch (_error) {
      console._error('Error saving theme:', error);
      alert('Gagal menyimpan tema');
    }
  };

  const handleEdit = (theme: RobuxTheme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      description: theme.description || '',
      robuxAmount: theme.robuxAmount,
      price: theme.price,
      themeType: theme.themeType,
      isPremium: theme.isPremium,
      order: theme.order
    });
    setShowModal(true);
  };

  const handleToggleActive = async (theme: RobuxTheme) => {
    try {
      const response = await fetch('/api/admin/robux-themes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...theme,
          isActive: !theme.isActive
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchThemes();
      } else {
        alert('Gagal mengubah status tema: ' + data.message);
      }
    } catch (_error) {
      console._error('Error toggling theme status:', error);
      alert('Gagal mengubah status tema');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      robuxAmount: 0,
      price: 0,
      themeType: 'theme1',
      isPremium: false,
      order: 0
    });
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data tema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Tema Robux Via Login</h1>
          <p className="text-gray-600">Atur tema dan harga Robux untuk topup via login</p>
        </div>
        <button
          onClick={() => {
            setEditingTheme(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Tambah Tema
        </button>
      </div>

      {/* Tambahkan pengaturan canOrder */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pengaturan Pesanan Via Login</h2>
            <p className="text-sm text-gray-600 mt-1">Aktifkan atau nonaktifkan kemampuan pelanggan untuk melakukan pemesanan via login</p>
          </div>
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-700">
              {canOrder ? 'Pesanan Diizinkan' : 'Pesanan Ditutup'}
            </span>
            <button
              onClick={() => updateCanOrder(!canOrder)}
              disabled={updatingSettings}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${canOrder ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${canOrder ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
        {updatingSettings && (
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span>Memperbarui pengaturan...</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tema
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Robux
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urutan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {themes.map((theme) => (
                <tr key={theme.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{theme.name}</div>
                      {theme.description && (
                        <div className="text-sm text-gray-500">{theme.description}</div>
                      )}
                      {theme.isPremium && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                          Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {theme.robuxAmount.toLocaleString()} Robux
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatRupiah(theme.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="capitalize">{theme.themeType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(theme)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        theme.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {theme.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {theme.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(theme)}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {themes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <i className="fas fa-gamepad text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada tema robux</h3>
              <p className="text-gray-500 mb-4">Mulai dengan menambahkan tema robux pertama</p>
              <button
                onClick={() => {
                  setEditingTheme(null);
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Tambah Tema
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTheme ? 'Edit Tema Robux' : 'Tambah Tema Robux'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Tema *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: Paket Hemat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Deskripsi tema (opsional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Robux *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.robuxAmount}
                      onChange={(e) => setFormData({ ...formData, robuxAmount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Tema *
                    </label>
                    <select
                      required
                      value={formData.themeType}
                      onChange={(e) => setFormData({ ...formData, themeType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="theme1">Tema 1</option>
                      <option value="theme2">Tema 2</option>
                      <option value="theme3">Tema 3</option>
                      <option value="small">Small</option>
                      <option value="regular">Regular</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urutan
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPremium}
                      onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Tema Premium (akan menampilkan modal peringatan)
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingTheme ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}