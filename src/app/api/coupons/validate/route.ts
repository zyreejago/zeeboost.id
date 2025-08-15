import { NextRequest, NextResponse } from 'next/server';
import { Discount } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Kode kupon diperlukan' },
        { status: 400 }
      );
    }
    
    const discount = await Discount.findByCode(code);
    
    if (!discount) {
      return NextResponse.json(
        { success: false, message: 'Kode kupon tidak valid' },
        { status: 200 }
      );
    }
    
    // Validasi coupon
    const now = new Date();
    const isValid = (
      discount.isActive &&
      (!discount.validUntil || new Date(discount.validUntil) > now) &&
      (discount.maxUses === 0 || discount.currentUses < discount.maxUses)
    );
    
    if (!isValid) {
      let message = 'Kupon tidak valid';
      if (!discount.isActive) {
        message = 'Kupon tidak aktif';
      } else if (discount.validUntil && new Date(discount.validUntil) <= now) {
        message = 'Kupon sudah kedaluwarsa';
      } else if (discount.maxUses > 0 && discount.currentUses >= discount.maxUses) {
        message = 'Kupon sudah mencapai batas penggunaan';
      }
      
      return NextResponse.json(
        { success: false, message },
        { status: 200 }
      );
    }
    
    return NextResponse.json({
      success: true,
      coupon: {
        id: discount.id,
        code: discount.code,
        discount: discount.value,
        type: discount.type
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memvalidasi kupon' },
      { status: 500 }
    );
  }
}