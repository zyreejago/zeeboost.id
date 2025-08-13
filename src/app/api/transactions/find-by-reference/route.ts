import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Reference number diperlukan' },
        { status: 400 }
      );
    }

    // Cari transaksi berdasarkan paymentProof (reference)
    const transaction = await prisma.transaction.findFirst({
      where: {
        paymentProof: reference
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
        { error: 'Transaksi tidak ditemukan dengan reference ini' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        robuxAmount: transaction.robuxAmount,
        totalPrice: transaction.totalPrice,
        finalPrice: transaction.finalPrice,
        method: transaction.method,
        status: transaction.status,
        paymentProof: transaction.paymentProof,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        user: {
          robloxUsername: transaction.user.robloxUsername,
          email: transaction.user.email
        }
      }
    });
  } catch (_error) {
    console._error('Find transaction by reference error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mencari transaksi' },
      { status: 500 }
    );
  }
}