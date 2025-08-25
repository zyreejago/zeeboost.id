'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviewPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    isAnonymous: false,
    rating: 0,
    suggestion: '',
    image: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleStarClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.isAnonymous ? 'Anonim' : formData.name);
      formDataToSend.append('rating', formData.rating.toString());
      formDataToSend.append('suggestion', formData.suggestion);
      formDataToSend.append('isAnonymous', formData.isAnonymous.toString());
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        throw new Error('Gagal mengirim review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Gagal mengirim review. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoveredStar || formData.rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className={`text-2xl transition-colors duration-200 ${
                isFilled ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 focus:outline-none`}
            >
              ★
            </button>
          );
        })}
        <span className="ml-2 text-sm text-gray-600">
          {formData.rating > 0 ? `${formData.rating}/5` : 'Pilih rating'}
        </span>
      </div>
    );
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Terkirim!</h1>
          <p className="text-gray-600 mb-4">Terima kasih atas feedback Anda</p>
          <p className="text-sm text-gray-500">Anda akan diarahkan ke beranda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Berikan Review</h1>
          <p className="text-gray-600">Bagikan pengalaman Anda dengan layanan kami</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama
            </label>
            <div className="space-y-2">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={formData.isAnonymous}
                placeholder={formData.isAnonymous ? "Anonim" : "Masukkan nama Anda"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
                required={!formData.isAnonymous}
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Kirim sebagai Anonim</span>
              </label>
            </div>
          </div>

          {/* Rating Bintang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Layanan *
            </label>
            <div className="p-3 border border-gray-300 rounded-lg">
              {renderStars()}
            </div>
            {formData.rating === 0 && (
              <p className="text-xs text-red-500 mt-1">Silakan pilih rating terlebih dahulu</p>
            )}
          </div>

          {/* Saran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saran & Masukan
            </label>
            <textarea
              name="suggestion"
              value={formData.suggestion}
              onChange={handleInputChange}
              rows={4}
              placeholder="Bagikan pengalaman, saran, atau masukan Anda..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Upload Gambar (Opsional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Gambar (Opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary-dark"
            />
            {formData.image && (
              <p className="text-sm text-gray-600 mt-1">File: {formData.image.name}</p>
            )}
          </div>

          {/* Tombol */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0}
              className="w-full bg-primary-dark text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Review'}
            </button>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}