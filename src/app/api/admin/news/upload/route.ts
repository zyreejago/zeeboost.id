import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `news_${timestamp}.${fileExtension}`;
    
    // Save file to public/uploads/news directory
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'news');
    const filePath = join(uploadsDir, fileName);
    
    try {
      await writeFile(filePath, buffer);
    } catch (writeError) {
      // If directory doesn't exist, create it
      const { mkdir } = await import('fs/promises');
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(filePath, buffer);
    }
    
    const imageUrl = `/uploads/news/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
  } catch (_error) {
    console.error('Error uploading image:', _error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}