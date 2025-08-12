import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: parseInt(transactionId)
      },
      include: {
        user: {
          select: {
            robloxUsername: true,
            email: true
          }
        },
        robuxStock: true
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

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
          robloxUsername: transaction.user.robloxUsername
        }
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
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

    // Cari transaksi berdasarkan username Roblox
    const transactions = await prisma.transaction.findMany({
      where: {
        user: {
          robloxUsername: {
            equals: robloxUsername
            // Hapus mode: 'insensitive' karena tidak valid
          }
        }
      },
      include: {
        user: {
          select: {
            robloxUsername: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

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
        robloxUsername: transaction.user.robloxUsername
      }
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Check order error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek pesanan' },
      { status: 500 }
    );
  }
}