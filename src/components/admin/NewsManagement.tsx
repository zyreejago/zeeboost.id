import React, { useState } from 'react';
import { News } from '@/types/admin';
import dynamic from 'next/dynamic';
import Image from 'next/image';


// Import MD Editor yang kompatibel dengan React 18+
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface NewsManagementProps {
  news: News[];
  onRefresh: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function NewsManagement({ 
  news, 
  onRefresh, 
  isLoading, 
  setIsLoading 
}: NewsManagementProps) {
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    isPublished: false,
  });
  
  // State untuk edit mode
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    isPublished: false,
  });
  
  // State untuk upload gambar
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // State untuk upload gambar edit
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');

  // Handle perubahan gambar untuk form tambah
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  // Handle perubahan gambar untuk form edit
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setEditImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Upload gambar ke server
  const uploadImage = async (imageFile: File): Promise<string | null> => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch('/api/admin/news/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (_error) {
      console._error('Error uploading image:', error);
      alert('Gagal mengupload gambar!');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle submit form tambah news
  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrl = newsForm.imageUrl;
      
      // Upload gambar jika ada file yang dipilih
      if (selectedImage) {
        const uploadedImageUrl = await uploadImage(selectedImage);
        if (uploadedImageUrl) {
          finalImageUrl = uploadedImageUrl;
        }
      }

      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newsForm,
          imageUrl: finalImageUrl
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setNewsForm({ title: '', content: '', excerpt: '', imageUrl: '', isPublished: false });
        setSelectedImage(null);
        setImagePreview('');
        onRefresh();
        alert('News berhasil ditambahkan!');
      } else {
        throw new Error(data.error || 'Gagal menambahkan news');
      }
    } catch (_error) {
      console._error('Error adding news:', error);
      alert(`Gagal menambahkan news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle edit news
  const startEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setEditForm({
      title: newsItem.title,
      content: newsItem.content,
      excerpt: newsItem.excerpt || '',
      imageUrl: newsItem.imageUrl || '',
      isPublished: newsItem.isPublished,
    });
    setEditSelectedImage(null);
    setEditImagePreview('');
  };
  
  // Handle submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    
    setIsLoading(true);

    try {
      let finalImageUrl = editForm.imageUrl;
      
      // Upload gambar baru jika ada
      if (editSelectedImage) {
        const uploadedImageUrl = await uploadImage(editSelectedImage);
        if (uploadedImageUrl) {
          finalImageUrl = uploadedImageUrl;
        }
      }

      const response = await fetch(`/api/admin/news/${editingNews.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          imageUrl: finalImageUrl
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setEditingNews(null);
        setEditForm({ title: '', content: '', excerpt: '', imageUrl: '', isPublished: false });
        setEditSelectedImage(null);
        setEditImagePreview('');
        onRefresh();
        alert('News berhasil diperbarui!');
      } else {
        throw new Error(data.error || 'Gagal memperbarui news');
      }
    } catch (_error) {
      console._error('Error updating news:', error);
      alert(`Gagal memperbarui news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel edit
  const cancelEdit = () => {
    setEditingNews(null);
    setEditForm({ title: '', content: '', excerpt: '', imageUrl: '', isPublished: false });
    setEditSelectedImage(null);
    setEditImagePreview('');
  };

  const deleteNews = async (id: number) => {
    if (!confirm('Yakin ingin menghapus news ini?')) return;
  
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      });
  
      const data = await response.json();
      
      if (response.ok) {
        if (typeof onRefresh === 'function') {
          onRefresh();
        } else {
          console.error('onRefresh is not a function');
          // Fallback: Reload halaman jika onRefresh tidak tersedia
          window.location.reload();
        }
        alert('News berhasil dihapus!');
      } else {
        throw new Error(data.error || 'Gagal menghapus news');
      }
    } catch (_error) {
      console._error('Error deleting news:', error);
      alert(`Gagal menghapus news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add News Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <i className="fas fa-plus-circle mr-3 text-primary-600"></i>
          Tambah News Baru
        </h3>
        <form onSubmit={handleNewsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul
              </label>
              <input
                type="text"
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>
            
            {/* Upload Gambar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Gambar
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={newsForm.excerpt}
              onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              rows={3}
              placeholder="Ringkasan singkat berita..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten
            </label>
            <div data-color-mode="light">
              <MDEditor
                value={newsForm.content}
                onChange={(val) => setNewsForm({ ...newsForm, content: val || '' })}
                height={300}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={newsForm.isPublished}
              onChange={(e) => setNewsForm({ ...newsForm, isPublished: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
              Publish sekarang
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all transform hover:scale-105"
          >
            {isLoading || uploadingImage ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {uploadingImage ? 'Uploading...' : 'Adding...'}
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Tambah News
              </>
            )}
          </button>
        </form>
      </div>

      {/* Edit News Form */}
      {editingNews && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <i className="fas fa-edit mr-3 text-primary-600"></i>
            Edit News: {editingNews.title}
          </h3>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              {/* Upload Gambar Edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Gambar Baru (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {editImagePreview ? (
                  <div className="mt-2">
                    <Image src={editImagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                  </div>
                ) : editForm.imageUrl && (
                  <div className="mt-2">
                    <Image src={editForm.imageUrl} alt="Current" className="h-20 w-20 object-cover rounded-lg" />
                    <p className="text-xs text-gray-500 mt-1">Gambar saat ini</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={editForm.excerpt}
                onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="Ringkasan singkat berita..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten
              </label>
              <div data-color-mode="light">
                <MDEditor
                  value={editForm.content}
                  onChange={(val) => setEditForm({ ...editForm, content: val || '' })}
                  height={300}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsPublished"
                checked={editForm.isPublished}
                onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="editIsPublished" className="ml-2 block text-sm text-gray-900">
                Publish sekarang
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading || uploadingImage}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {isLoading || uploadingImage ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {uploadingImage ? 'Uploading...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Update News
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all"
              >
                <i className="fas fa-times mr-2"></i>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <h3 className="text-lg font-medium text-primary-800 flex items-center">
            <i className="fas fa-list mr-3"></i>
            Daftar News
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.imageUrl && (
                        <Image className="h-10 w-10 rounded-lg object-cover mr-4" src={item.imageUrl} alt="" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        {item.excerpt && (
                          <div className="text-sm text-gray-500">{item.excerpt}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <i className="fas fa-edit mr-1"></i> Edit
                      </button>
                      <button
                        onClick={() => deleteNews(item.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <i className="fas fa-trash mr-1"></i> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}