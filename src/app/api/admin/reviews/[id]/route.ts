import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = parseInt(params.id);
    
    // Get review data first to delete image if exists
    const review = await db.getOne(
      'SELECT image_path FROM reviews WHERE id = ?',
      [reviewId]
    );
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Delete image file if exists
    if (review.image_path) {
      try {
        const imagePath = path.join(process.cwd(), 'public', review.image_path);
        await unlink(imagePath);
      } catch (error) {
        console.log('Image file not found or already deleted');
      }
    }
    
    // Delete from database
    const affectedRows = await db.remove('reviews', 'id = ?', [reviewId]);
    
    if (affectedRows > 0) {
      return NextResponse.json({ success: true, message: 'Review berhasil dihapus' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Review tidak ditemukan' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus review' },
      { status: 500 }
    );
  }
}