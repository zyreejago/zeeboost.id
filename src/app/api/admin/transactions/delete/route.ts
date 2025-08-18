import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionIds, deleteType } = await request.json();

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return NextResponse.json({ error: 'Invalid transaction IDs' }, { status: 400 });
    }

    // Validasi status yang diizinkan untuk dihapus
    let allowedStatuses = ['pending', 'failed'];
    if (deleteType === 'pending') {
      allowedStatuses = ['pending'];
    } else if (deleteType === 'failed') {
      allowedStatuses = ['failed'];
    }

    // Buat WHERE clause untuk multiple IDs dan status
    const placeholders = transactionIds.map(() => '?').join(', ');
    const statusPlaceholders = allowedStatuses.map(() => '?').join(', ');
    const whereClause = `id IN (${placeholders}) AND status IN (${statusPlaceholders})`;
    const whereParams = [...transactionIds, ...allowedStatuses];

    // Hapus transaksi menggunakan db.remove
    const deletedCount = await db.remove('Transaction', whereClause, whereParams);

    return NextResponse.json({
      success: true,
      deletedCount: deletedCount,
      message: `${deletedCount} transaksi berhasil dihapus`
    });

  } catch (error) {
    console.error('Error deleting transactions:', error);
    return NextResponse.json(
      { error: 'Failed to delete transactions' },
      { status: 500 }
    );
  }
}

// API untuk hapus semua transaksi pending/failed yang lebih dari X hari
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { days = 2, status = ['pending', 'failed'] } = await request.json();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateString = cutoffDate.toISOString().slice(0, 19).replace('T', ' ');

    // Buat WHERE clause untuk status dan tanggal
    const statusPlaceholders = status.map(() => '?').join(', ');
    const whereClause = `status IN (${statusPlaceholders}) AND createdAt < ?`;
    const whereParams = [...status, cutoffDateString];

    // Hapus transaksi lama menggunakan db.remove
    const deletedCount = await db.remove('Transaction', whereClause, whereParams);

    return NextResponse.json({
      success: true,
      deletedCount: deletedCount,
      message: `${deletedCount} transaksi lama berhasil dihapus`
    });

  } catch (error) {
    console.error('Error auto-deleting transactions:', error);
    return NextResponse.json(
      { error: 'Failed to auto-delete transactions' },
      { status: 500 }
    );
  }
}