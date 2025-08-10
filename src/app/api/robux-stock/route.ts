import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stocks = await prisma.robuxStock.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        amount: 'asc'
      }
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Error fetching robux stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch robux stock' },
      { status: 500 }
    );
  }
}