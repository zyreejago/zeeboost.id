import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

// DELETE - Hapus stock robux berdasarkan ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    await prisma.robuxStock.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Stock berhasil dihapus' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete robux stock' },
      { status: 500 }
    );
  }
}

// PUT - Update stock robux berdasarkan ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, price, isActive, allowOrders } = await request.json(); // Tambahkan allowOrders
    const id = parseInt(params.id);

    const robuxStock = await prisma.robuxStock.update({
      where: { id },
      data: { 
        amount, 
        price, 
        isActive, 
        allowOrders: allowOrders ?? true // Default true jika tidak ada
      },
    });

    return NextResponse.json(robuxStock);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update robux stock' },
      { status: 500 }
    );
  }
}