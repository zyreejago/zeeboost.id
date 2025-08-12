import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionId, status } = await request.json();

    if (!transactionId || !status) {
      return NextResponse.json({ error: 'Transaction ID and status are required' }, { status: 400 });
    }

    // Validasi status yang diizinkan
    const allowedStatuses = ['pending', 'processing', 'completed', 'failed'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(transactionId) },
      data: { status },
      include: {
        user: true,
        robuxStock: true
      }
    });

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: `Status transaksi berhasil diubah menjadi ${status}`
    });

  } catch (error) {
    console.error('Error updating transaction status:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction status' },
      { status: 500 }
    );
  }
}