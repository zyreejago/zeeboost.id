import { NextRequest, NextResponse } from 'next/server';
import { RobuxStock } from '@/lib/models';

export async function GET() {
  try {
    const stocks = await RobuxStock.getActive();
    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Error fetching robux stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch robux stocks' },
      { status: 500 }
    );
  }
}