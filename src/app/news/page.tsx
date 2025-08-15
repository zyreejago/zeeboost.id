import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { News } from '@/types/admin';

// Metadata untuk SEO
export const metadata: Metadata = {
  title: 'Berita & Update Terbaru - ZeeBoost',
  description: 'Dapatkan informasi terbaru seputar topup Robux, update game Roblox, tips gaming, dan berita menarik lainnya dari ZeeBoost - platform topup Robux terpercaya di Indonesia.',
  keywords: [
    'berita roblox',
    'update roblox',
    'news gaming',
    'tips roblox',
    'zeeboost news',
    'berita topup robux',
    'update gaming indonesia',
    'roblox indonesia'
  ],
  openGraph: {
    title: 'Berita & Update Terbaru - ZeeBoost',
    description: 'Dapatkan informasi terbaru seputar topup Robux, update game Roblox, tips gaming, dan berita menarik lainnya dari ZeeBoost.',
    type: 'website',
    url: 'https://zeeboost.com/news',
    images: [
      {
        url: 'https://zeeboost.com/og-news.jpg',
        width: 1200,
        height: 630,
        alt: 'ZeeBoost News & Updates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berita & Update Terbaru - ZeeBoost',
    description: 'Dapatkan informasi terbaru seputar topup Robux, update game Roblox, tips gaming dari ZeeBoost.',
  },
  alternates: {
    canonical: 'https://zeeboost.com/news',
  },
};

// Fetch news data
async function getNews(page: number = 1) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news?page=${page}&limit=12`, {
      next: { revalidate: 300 },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      throw new Error(`Failed to fetch news: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    
    // Handle error response from API
    if (data.error) {
      console.error('API returned error:', data.error);
      return { news: [], total: 0, totalPages: 0 };
    }
    
    // Ensure we always return the expected structure
    return {
      news: Array.isArray(data.news) ? data.news : (Array.isArray(data) ? data : []),
      total: typeof data.total === 'number' ? data.total : (Array.isArray(data) ? data.length : 0),
      totalPages: typeof data.totalPages === 'number' ? data.totalPages : 1
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return { news: [], total: 0, totalPages: 0 };
  }
}

interface NewsPageProps {
  searchParams: Promise<{ page?: string }>; // Updated for Next.js 15
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  try {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1');
    
    // Safer destructuring with default values
    const result = await getNews(currentPage);
    const news = result?.news || [];
    const total = result?.total || 0;
    const totalPages = result?.totalPages || 0;
  
    // Additional safety checks
    const safeNews = Array.isArray(news) ? news : [];
    const safeTotal = typeof total === 'number' ? total : 0;
    const safeTotalPages = typeof totalPages === 'number' ? totalPages : 0;
  
    // JSON-LD structured data untuk SEO
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Berita & Update Terbaru - ZeeBoost',
      description: 'Kumpulan berita dan update terbaru seputar topup Robux dan gaming dari ZeeBoost',
      url: 'https://zeeboost.com/news',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: safeTotal,
        itemListElement: safeNews.map((item: News, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Article',
            headline: item.title,
            description: item.excerpt || item.title,
            image: item.imageUrl,
            datePublished: item.createdAt,
            url: `https://zeeboost.com/news/${item.id}`,
          },
        })),
      },
    };
  
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <main className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li>
                  <Link href="/" className="hover:text-blue-600">
                    Beranda
                  </Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-gray-900 font-medium">
                  Berita
                </li>
              </ol>
            </nav>

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Berita & Update Terbaru
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Dapatkan informasi terbaru seputar topup Robux, update game Roblox, 
                tips gaming, dan berita menarik lainnya dari ZeeBoost.
              </p>
            </div>

            {/* News Grid */}
            {safeNews && safeNews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {safeNews.map((item: News) => (
                    <article key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      {item.imageUrl && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                          {item.title}
                        </h2>
                        {item.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {item.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <time className="text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                          <Link
                            href={`/news/${item.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Baca Selengkapnya →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {safeTotalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    {currentPage > 1 && (
                      <Link
                        href={`/news?page=${currentPage - 1}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ← Sebelumnya
                      </Link>
                    )}
                    
                    <span className="px-4 py-2 text-gray-600">
                      Halaman {currentPage} dari {safeTotalPages}
                    </span>
                    
                    {currentPage < safeTotalPages && (
                      <Link
                        href={`/news?page=${currentPage + 1}`}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Selanjutnya →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Belum Ada Berita</h2>
                <p className="text-gray-600">Berita terbaru akan segera hadir. Silakan kembali lagi nanti!</p>
              </div>
            )}
          </main>
          
          <Footer />
        </div>
      </>
    );
  } catch (error) {
    console.error('NewsPage error:', error);
    
    // Return error page
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-500">Maaf, terjadi kesalahan saat memuat berita. Silakan coba lagi nanti.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}