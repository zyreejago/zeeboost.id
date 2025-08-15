import { NextRequest, NextResponse } from 'next/server';
import { News } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';

// GET - Ambil semua berita
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const news = await News.getAll();
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST - Buat berita baru
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, excerpt, imageUrl, isPublished } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const newsData = {
      title,
      content,
      excerpt: excerpt || '',
      imageUrl: imageUrl || '',
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newsId = await News.create(newsData); // News.create sudah return insertId langsung
    console.log('✅ API received newsId:', newsId); // Debug log
    const createdNews = await News.findById(newsId);

    return NextResponse.json({
      success: true,
      news: createdNews,
      message: 'News created successfully'
    });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
}