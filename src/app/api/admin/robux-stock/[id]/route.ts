import { NextRequest, NextResponse } from 'next/server';
import { RobuxStock } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';

// GET - Ambil stock robux berdasarkan ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stock = await RobuxStock.findById(params.id);
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }
    return NextResponse.json(stock);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}

// PUT - Update stock robux
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stockData = await request.json();
    const updatedStock = await RobuxStock.update(params.id, stockData);

    return NextResponse.json(updatedStock);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}

// DELETE - Hapus stock robux
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isValid } = await verifyAdminToken();
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await RobuxStock.delete(params.id);

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to delete stock' }, { status: 500 });
  }
}