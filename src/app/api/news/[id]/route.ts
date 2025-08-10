import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Ambil detail news berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const newsId = parseInt(params.id);
    
    const news = await prisma.news.findFirst({
      where: {
        id: newsId,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    if (!news) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}