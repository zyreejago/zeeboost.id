import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';
import { Prisma } from '@prisma/client';

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

    const whereCondition: Prisma.TransactionWhereInput = {
      id: { in: transactionIds }
    };

    // Hanya izinkan hapus transaksi pending dan failed
    if (deleteType === 'pending') {
      whereCondition.status = 'pending';
    } else if (deleteType === 'failed') {
      whereCondition.status = 'failed';
    } else if (deleteType === 'pending_failed') {
      whereCondition.status = { in: ['pending', 'failed'] };
    } else {
      // Default: hanya pending dan failed
      whereCondition.status = { in: ['pending', 'failed'] };
    }

    const deletedTransactions = await prisma.transaction.deleteMany({
      where: whereCondition
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedTransactions.count,
      message: `${deletedTransactions.count} transaksi berhasil dihapus`
    });

  } catch (_error) {
    console.error('Error deleting transactions:', _error);
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

    const deletedTransactions = await prisma.transaction.deleteMany({
      where: {
        status: { in: status },
        createdAt: { lt: cutoffDate }
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedTransactions.count,
      message: `${deletedTransactions.count} transaksi lama berhasil dihapus`
    });

  } catch (_error) {
    console.error('Error auto-deleting transactions:', _error);
    return NextResponse.json(
      { error: 'Failed to auto-delete transactions' },
      { status: 500 }
    );
  }
}