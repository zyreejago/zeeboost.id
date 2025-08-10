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
      next: { revalidate: 300 }, // Revalidate setiap 5 menit
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return { news: [], total: 0, totalPages: 0 };
  }
}

interface NewsPageProps {
  searchParams: { page?: string };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const currentPage = parseInt(searchParams.page || '1');
  const { news, total, totalPages } = await getNews(currentPage);

  // JSON-LD structured data untuk SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Berita & Update Terbaru - ZeeBoost',
    description: 'Kumpulan berita dan update terbaru seputar topup Robux dan gaming dari ZeeBoost',
    url: 'https://zeeboost.com/news',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListElement: news.map((item: News, index: number) => ({
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
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Beranda
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-medium">Berita</span>
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
          {news.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {news.map((item: News) => (
                  <article key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {item.imageUrl && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <time 
                        className="text-sm text-gray-500 mb-2 block"
                        dateTime={item.createdAt}
                      >
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        <Link 
                          href={`/news/${item.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {item.title}
                        </Link>
                      </h2>
                      
                      {item.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {item.excerpt}
                        </p>
                      )}
                      
                      <Link 
                        href={`/news/${item.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Baca Selengkapnya
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/news?page=${currentPage - 1}`}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Sebelumnya
                    </Link>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/news?page=${page}`}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </Link>
                  ))}
                  
                  {currentPage < totalPages && (
                    <Link
                      href={`/news?page=${currentPage + 1}`}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Selanjutnya
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Berita</h3>
              <p className="text-gray-600">Berita dan update terbaru akan segera hadir.</p>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
}