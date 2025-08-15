import { NextRequest, NextResponse } from 'next/server';
import { News } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const news = await News.findById(parseInt(params.id));
    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, excerpt, imageUrl, isPublished } = await request.json();
    
    const updateData = {
      title,
      content,
      excerpt: excerpt || '',
      imageUrl: imageUrl || '',
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
      updatedAt: new Date()
    };

    await News.update(parseInt(params.id), updateData);
    const updatedNews = await News.findById(parseInt(params.id));

    return NextResponse.json({
      success: true,
      news: updatedNews,
      message: 'News updated successfully'
    });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await News.delete(parseInt(params.id));

    return NextResponse.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}