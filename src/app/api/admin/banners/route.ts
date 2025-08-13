import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });

    return NextResponse.json(banners);
  } catch (_error) {
    console._error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const isActive = formData.get('isActive') === 'true';
    const order = parseInt(formData.get('order') as string);
    const imageFile = formData.get('image') as File;

    if (!title || !imageFile) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `banner_${timestamp}.${fileExtension}`;
    
    // Save file to public/uploads/banners directory
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'banners');
    const filePath = join(uploadsDir, fileName);
    
    try {
      await writeFile(filePath, buffer);
    } catch (writeError) {
      // If directory doesn't exist, create it
      const { mkdir } = await import('fs/promises');
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(filePath, buffer);
    }
    
    // Create banner record with image URL
    const imageUrl = `/uploads/banners/${fileName}`;
    
    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        imageUrl,
        isActive,
        order,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (_error) {
    console._error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}