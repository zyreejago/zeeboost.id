import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Get banners error:', error);
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
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}