import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const reviews = await db.getMany(
      'SELECT * FROM reviews ORDER BY created_at DESC'
    );
    
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data review' },
      { status: 500 }
    );
  }
}