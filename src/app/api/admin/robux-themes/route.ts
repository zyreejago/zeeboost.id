import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Ambil semua tema robux
export async function GET() {
  try {
    const themes = await prisma.robuxTheme.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json({ success: true, themes });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data tema robux' },
      { status: 500 }
    );
  }
}

// POST - Buat tema robux baru
export async function POST(request: NextRequest) {
  try {
    const { name, description, robuxAmount, price, themeType, isPremium, order } = await request.json();
    
    const theme = await prisma.robuxTheme.create({
      data: {
        name,
        description,
        robuxAmount,
        price,
        themeType,
        isPremium,
        order
      }
    });
    
    return NextResponse.json({ success: true, theme });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat tema robux' },
      { status: 500 }
    );
  }
}

// PUT - Update tema robux
export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, robuxAmount, price, themeType, isPremium, order, isActive } = await request.json();
    
    const theme = await prisma.robuxTheme.update({
      where: { id },
      data: {
        name,
        description,
        robuxAmount,
        price,
        themeType,
        isPremium,
        order,
        isActive
      }
    });
    
    return NextResponse.json({ success: true, theme });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate tema robux' },
      { status: 500 }
    );
  }
}