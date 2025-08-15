import { NextRequest, NextResponse } from 'next/server';
import { Transaction, User, RobuxStock } from '@/lib/models';

// GET method untuk mengambil transaksi berdasarkan ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID diperlukan' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findById(parseInt(transactionId));

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ambil data user dan robuxStock secara terpisah
    const user = await User.findById(transaction.userId);
    const robuxStock = transaction.robuxStockId ? await RobuxStock.findById(transaction.robuxStockId) : null;

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        robuxAmount: transaction.robuxAmount,
        totalPrice: transaction.totalPrice,
        method: transaction.method,
        status: transaction.status,
        createdAt: transaction.createdAt,
        paymentProof: transaction.paymentProof,
        user: {
          robloxUsername: user?.robloxUsername
        }
      }
    });
  } catch (_error) {
    console.error('Get transaction error:', _error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil transaksi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { robloxUsername } = await request.json();
    
    if (!robloxUsername) {
      return NextResponse.json(
        { error: 'Username Roblox diperlukan' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan username Roblox
    const user = await User.findByRobloxUsername(robloxUsername);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak ada pesanan ditemukan untuk username ini' },
        { status: 404 }
      );
    }
    
    // Cari transaksi berdasarkan userId
    const transactions = await Transaction.findByUserId(user.id);

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada pesanan ditemukan untuk username ini' },
        { status: 404 }
      );
    }

    // Format response data
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      robuxAmount: transaction.robuxAmount,
      totalPrice: transaction.totalPrice,
      method: transaction.method,
      status: transaction.status,
      createdAt: transaction.createdAt,
      paymentProof: transaction.paymentProof,
      user: {
        robloxUsername: user.robloxUsername
      }
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      total: transactions.length
    });
  } catch (_error) {
    console.error('Check order error:', _error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek pesanan' },
      { status: 500 }
    );
  }
}