'use client';

import React, { useState } from 'react';
import { Banner } from '@/types/admin';
import Image from 'next/image';


interface BannerManagementProps {
  banners: Banner[];
  onRefresh: () => void;
}

export default function BannerManagement({ banners, onRefresh }: BannerManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    isActive: true,
    order: 1
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      isActive: banner.isActive,
      order: banner.order
    });
    setSelectedImage(null);
    setImagePreview(banner.imageUrl || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      isActive: true,
      order: 1
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('order', formData.order.toString());
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const url = editingBanner 
        ? `/api/admin/banners/${editingBanner.id}`
        : '/api/admin/banners';
      
      const method = editingBanner ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert(editingBanner ? 'Banner berhasil diperbarui!' : 'Banner berhasil ditambahkan!');
        handleCancel();
        onRefresh();
      } else {
        alert('Gagal menyimpan banner!');
      }
    } catch (_error) {
      console._error('Error saving banner:', error);
      alert('Terjadi kesalahan!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus banner ini?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        alert('Banner berhasil dihapus!');
        onRefresh();
      } else {
        alert('Gagal menghapus banner!');
      }
    } catch (_error) {
      console._error('Error deleting banner:', error);
      alert('Terjadi kesalahan!');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (banner: Banner) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...banner,
          isActive: !banner.isActive
        })
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert('Gagal mengubah status banner!');
      }
    } catch (_error) {
      console._error('Error toggling banner status:', error);
      alert('Terjadi kesalahan!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Add/Edit Banner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h2 className="text-xl font-semibold text-primary-800 flex items-center">
            <i className="fas fa-images mr-3"></i>
            {isEditing ? 'Edit Banner' : 'Tambah Banner Baru'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Banner *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan judul banner"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Masukkan subtitle (opsional)"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Gambar Banner {!isEditing && '*'}
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
                required={!isEditing}
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-32 w-auto rounded border shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urutan Tampil
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1"
                required
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Banner Aktif</span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Menyimpan...' : (isEditing ? 'Perbarui Banner' : 'Tambah Banner')}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Daftar Banner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h2 className="text-xl font-semibold text-primary-800 flex items-center">
            <i className="fas fa-list mr-3"></i>
            Daftar Banner
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul & Subtitle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urutan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {banner.imageUrl ? (
                      <Image 
                        src={banner.imageUrl} 
                        alt={banner.title}
                        className="h-16 w-24 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/96x64/e5e7eb/9ca3af?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="h-16 w-24 bg-gray-200 rounded border flex items-center justify-center">
                        <i className="fas fa-image text-gray-400"></i>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                    {banner.subtitle && (
                      <div className="text-sm text-gray-500">{banner.subtitle}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      #{banner.order}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(banner)}
                      disabled={isLoading}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        banner.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        banner.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {banner.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-primary hover:text-primary-dark transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {banners.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <i className="fas fa-images text-4xl"></i>
            </div>
            <p className="text-gray-500">Belum ada banner</p>
          </div>
        )}
      </div>
    </div>
  );
}