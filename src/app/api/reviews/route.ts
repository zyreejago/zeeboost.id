import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const rating = parseInt(formData.get('rating') as string);
    const suggestion = formData.get('suggestion') as string;
    const isAnonymous = formData.get('isAnonymous') === 'true';
    const image = formData.get('image') as File | null;

    // Validasi rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating harus antara 1-5' },
        { status: 400 }
      );
    }

    let imagePath = null;

    // Handle image upload if provided
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public/uploads/reviews');
      await mkdir(uploadsDir, { recursive: true });
      
      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(image.name);
      const filename = `review_${timestamp}${extension}`;
      imagePath = `/uploads/reviews/${filename}`;
      
      // Save file
      await writeFile(path.join(uploadsDir, filename), buffer);
    }

    // Save to database using db.create method
    const reviewData = {
      name: name,
      rating: rating,
      suggestion: suggestion,
      image_path: imagePath,
      is_anonymous: isAnonymous,
      created_at: new Date()
    };
    
    await db.create('reviews', reviewData);

    return NextResponse.json({ success: true, message: 'Review berhasil disimpan' });
  } catch (error) {
    console.error('Error saving review:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan review' },
      { status: 500 }
    );
  }
}