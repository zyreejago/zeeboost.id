import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Kode kupon diperlukan' },
        { status: 400 }
      );
    }

    // Cari discount berdasarkan kode
    const discount = await prisma.discount.findUnique({
      where: { 
        code: code.toUpperCase(),
      },
    });

    // Validasi discount tidak ditemukan
    if (!discount) {
      return NextResponse.json({
        success: false,
        message: 'Kode kupon tidak valid'
      });
    }

    // Validasi discount tidak aktif
    if (!discount.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Kode kupon sudah tidak aktif'
      });
    }

    // Validasi masa berlaku
    if (discount.validUntil && new Date() > discount.validUntil) {
      return NextResponse.json({
        success: false,
        message: 'Kode kupon sudah kedaluwarsa'
      });
    }

    // Validasi batas penggunaan
    if (discount.maxUses > 0 && discount.currentUses >= discount.maxUses) {
      return NextResponse.json({
        success: false,
        message: 'Kode kupon sudah mencapai batas penggunaan'
      });
    }

    // Return data kupon yang valid
    return NextResponse.json({
      success: true,
      coupon: {
        code: discount.code,
        discount: discount.value,
        type: discount.type,
        minPurchase: discount.minPurchase
      }
    });

  } catch (_error) {
    console._error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memvalidasi kupon' },
      { status: 500 }
    );
  }
}