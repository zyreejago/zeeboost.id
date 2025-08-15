import { NextRequest, NextResponse } from 'next/server';
import { Banner } from '@/lib/models';

export async function GET() {
  try {
    const banners = await Banner.getActive();
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, subtitle, imageUrl, isActive, order } = await request.json();
    
    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });
    
    return NextResponse.json(banner);
  } catch (_error) {
    console.error('Create banner error:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}