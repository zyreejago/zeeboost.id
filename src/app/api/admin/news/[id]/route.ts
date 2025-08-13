import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

// PUT - Update news
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newsId = parseInt(params.id);
    const { title, content, excerpt, imageUrl, isPublished } = await request.json();

    const news = await prisma.news.update({
      where: { id: newsId },
      data: {
        title,
        content,
        excerpt,
        imageUrl,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(news);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus news
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newsId = parseInt(params.id);
    
    await prisma.news.delete({
      where: { id: newsId },
    });

    return NextResponse.json({ message: 'News deleted successfully' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}