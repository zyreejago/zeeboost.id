'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners');
      const data = await response.json();
      setBanners(data);
    } catch (_error) {
      console.error('Failed to fetch banners:', _error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingBanner 
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners';
      
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm),
      });

      if (response.ok) {
        setBannerForm({ title: '', subtitle: '', imageUrl: '', isActive: true, order: 0 });
        setEditingBanner(null);
        setShowForm(false);
        fetchBanners();
        alert(editingBanner ? 'Banner berhasil diupdate!' : 'Banner berhasil ditambahkan!');
      }
    } catch (_error) {
      alert('Gagal menyimpan banner!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || '',
      isActive: banner.isActive,
      order: banner.order,
    });
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus banner ini?')) return;

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBanners();
        alert('Banner berhasil dihapus!');
      }
    } catch (_error) {
      alert('Gagal menghapus banner!');
    }
  };

  const resetForm = () => {
    setBannerForm({ title: '', subtitle: '', imageUrl: '', isActive: true, order: 0 });
    setEditingBanner(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-image text-white text-sm"></i>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                Banner Management
              </h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105"
            >
              <i className="fas fa-plus mr-2"></i>
              Tambah Banner
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBanner ? 'Edit Banner' : 'Tambah Banner'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Banner *
                  </label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Gambar
                  </label>
                  <input
                    type="url"
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={bannerForm.order}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={bannerForm.isActive}
                    onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Banner Aktif
                  </label>
                </div>

                {/* Preview */}
                {bannerForm.imageUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4">
                      <Image
                        src={bannerForm.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200/e5e7eb/6b7280?text=Image+Not+Found';
                        }}
                      />
                      <div className="mt-2">
                        <h3 className="font-semibold">{bannerForm.title}</h3>
                        {bannerForm.subtitle && (
                          <p className="text-sm text-gray-600">{bannerForm.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all"
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        {editingBanner ? 'Update' : 'Simpan'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Banner List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
            <h2 className="text-xl font-semibold text-primary-800 flex items-center">
              <i className="fas fa-list mr-3"></i>
              Daftar Banner ({banners.length})
            </h2>
          </div>

          {banners.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-image text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-500 text-lg">Belum ada banner</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                Tambah Banner Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {banners.map((banner) => (
                <div key={banner.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={banner.imageUrl || 'https://via.placeholder.com/400x200/e5e7eb/6b7280?text=No+Image'}
                      alt={banner.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200/e5e7eb/6b7280?text=Image+Error';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                        Order: {banner.order}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{banner.subtitle}</p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        {new Date(banner.createdAt).toLocaleDateString('id-ID')}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="text-primary-600 hover:text-primary-800 p-2 rounded-lg hover:bg-primary-50 transition-all"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all"
                          title="Hapus"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}