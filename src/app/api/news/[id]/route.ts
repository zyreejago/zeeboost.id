import { NextRequest, NextResponse } from 'next/server';
import { News } from '@/lib/models';

// GET - Ambil detail news berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const newsId = parseInt(params.id);
    
    const news = await News.findById(newsId);

    if (!news || !news.isPublished) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    // Pilih field yang diperlukan
    const newsData = {
      id: news.id,
      title: news.title,
      content: news.content,
      excerpt: news.excerpt,
      imageUrl: news.imageUrl,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
    };

    return NextResponse.json(newsData);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}