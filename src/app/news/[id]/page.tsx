import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { News } from '@/types/admin';
import MarkdownContent from '@/components/MarkdownContent';

// Fetch single news
async function getNews(id: string): Promise<News | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news/${id}`, {
      next: { revalidate: 300 }, // Revalidate setiap 5 menit
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

// Fetch related news
async function getRelatedNews(currentId: number): Promise<News[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news?limit=4`, {
      next: { revalidate: 300 },
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.news.filter((news: News) => news.id !== currentId);
  } catch (error) {
    console.error('Error fetching related news:', error);
    return [];
  }
}

// Generate metadata untuk SEO dinamis berdasarkan konten berita
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const news = await getNews(params.id);
  
  if (!news) {
    return {
      title: 'Berita Tidak Ditemukan - ZeeBoost',
      description: 'Berita yang Anda cari tidak ditemukan.',
    };
  }

  // Menggunakan createdAt karena publishedAt tidak ada pada tipe News
  const formattedDate = new Date(news.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Ekstrak keywords dari title dan content untuk SEO dinamis
  const titleWords = news.title.toLowerCase().split(' ').filter(word => word.length > 3);
  const dynamicKeywords = [
    ...titleWords,
    'berita roblox',
    'zeeboost news',
    'topup robux',
    'gaming indonesia',
    'roblox indonesia'
  ];

  return {
    title: `${news.title} - ZeeBoost News`,
    description: news.excerpt || `Baca berita terbaru: ${news.title}. Update dan informasi menarik seputar topup Robux dan gaming dari ZeeBoost.`,
    keywords: dynamicKeywords,
    openGraph: {
      title: `${news.title} - ZeeBoost News`,
      description: news.excerpt || `Baca berita terbaru: ${news.title}`,
      type: 'article',
      url: `https://zeeboost.com/news/${news.id}`,
      images: news.imageUrl ? [
        {
          url: news.imageUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ] : [],
      publishedTime: news.createdAt,
      authors: ['ZeeBoost Team'],
      section: 'Gaming News',
      tags: titleWords,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${news.title} - ZeeBoost News`,
      description: news.excerpt || `Baca berita terbaru: ${news.title}`,
      images: news.imageUrl ? [news.imageUrl] : [],
    },
    alternates: {
      canonical: `https://zeeboost.com/news/${news.id}`,
    },
    other: {
      'article:published_time': news.createdAt,
      'article:author': 'ZeeBoost Team',
      'article:section': 'Gaming News',
    },
  };
}

interface NewsDetailPageProps {
  params: { id: string };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const news = await getNews(params.id);
  
  if (!news) {
    notFound();
  }

  const relatedNews = await getRelatedNews(news.id);
  const formattedDate = new Date(news.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // JSON-LD structured data untuk SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: news.title,
    description: news.excerpt || news.title,
    image: news.imageUrl,
    datePublished: news.createdAt,
    dateModified: news.createdAt,
    author: {
      '@type': 'Organization',
      name: 'ZeeBoost',
      url: 'https://zeeboost.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ZeeBoost',
      logo: {
        '@type': 'ImageObject',
        url: 'https://zeeboost.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://zeeboost.com/news/${news.id}`,
    },
    articleSection: 'Gaming News',
    keywords: news.title.toLowerCase().split(' ').join(', '),
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
                <Link href="/news" className="hover:text-blue-600 transition-colors">
                  Berita
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-900 font-medium line-clamp-1">{news.title}</span>
              </li>
            </ol>
          </nav>

          <article className="max-w-4xl mx-auto">
            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {news.title}
              </h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                <time dateTime={news.createdAt} className="text-sm">
                  Dipublikasikan pada {formattedDate}
                </time>
                <span className="mx-2">•</span>
                <span className="text-sm">oleh ZeeBoost Team</span>
              </div>

              {news.imageUrl && (
                <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={news.imageUrl}
                    alt={news.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                </div>
              )}
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <MarkdownContent content={news.content} />
            </div>

            {/* Social Share */}
            <div className="border-t border-gray-200 pt-8 mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bagikan Artikel</h3>
              <div className="flex space-x-4">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://zeeboost.com/news/${news.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
                
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://zeeboost.com/news/${news.id}`)}&text=${encodeURIComponent(news.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </a>
                
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${news.title} - https://zeeboost.com/news/${news.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Related News */}
            {relatedNews.length > 0 && (
              <section className="border-t border-gray-200 pt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Berita Terkait</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedNews.slice(0, 3).map((item) => (
                    <article key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      {item.imageUrl && (
                        <div className="relative h-32 w-full">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      
                      <div className="p-4">
                        <time 
                          className="text-xs text-gray-500 mb-2 block"
                          dateTime={item.createdAt}
                        >
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          <Link 
                            href={`/news/${item.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {item.title}
                          </Link>
                        </h3>
                        
                        {item.excerpt && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {item.excerpt}
                          </p>
                        )}
                        
                        <Link 
                          href={`/news/${item.id}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          Baca Selengkapnya
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </article>
        </main>
        
        <Footer />
      </div>
    </>
  );
}