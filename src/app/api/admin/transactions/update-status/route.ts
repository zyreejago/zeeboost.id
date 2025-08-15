import { NextRequest, NextResponse } from 'next/server';
import { Transaction, User, RobuxStock } from '@/lib/models';
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

    const updatedTransaction = await Transaction.update(parseInt(transactionId), { status });
    const transaction = await Transaction.findById(parseInt(transactionId));
    const user = await User.findById(transaction.userId);
    const robuxStock = await RobuxStock.findById(transaction.robuxStockId);

    return NextResponse.json({
      success: true,
      transaction: {
        ...transaction,
        user,
        robuxStock
      },
      message: `Status transaksi berhasil diubah menjadi ${status}`
    });

  } catch (_error) {
    console.error('Error updating transaction status:', _error);
    return NextResponse.json(
      { error: 'Failed to update transaction status' },
      { status: 500 }
    );
  }
}