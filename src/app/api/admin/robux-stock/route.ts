import { NextRequest, NextResponse } from 'next/server';
import { RobuxStock } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';

// GET - Ambil semua stock robux
export async function GET() {
  try {
    const stocks = await RobuxStock.getAll();
    return NextResponse.json(stocks);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch robux stock' },
      { status: 500 }
    );
  }
}

// POST - Update stock robux
export async function POST(request: Request) {
  try {
    const { isValid } = await verifyAdminToken();
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, price, isActive, allowOrders } = await request.json();

    const stock = await RobuxStock.create({
      amount,
      price,
      isActive,
      allowOrders: allowOrders ?? true // default true jika tidak ada
    });

    return NextResponse.json(stock);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create stock' }, { status: 500 });
  }
}