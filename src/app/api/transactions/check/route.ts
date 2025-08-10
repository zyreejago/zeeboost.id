import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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