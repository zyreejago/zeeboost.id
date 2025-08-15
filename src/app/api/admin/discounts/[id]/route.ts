import { NextRequest, NextResponse } from 'next/server';
import { Discount } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';

// PUT - Update discount
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const discountId = parseInt(params.id);
    const { code, name, description, type, value, maxUses, minPurchase, isActive, validUntil } = await request.json();

    // Validasi kode discount unik (kecuali untuk discount yang sedang diedit)
    const existingDiscount = await Discount.findByCode(code);

    if (existingDiscount && existingDiscount.id !== discountId) {
      return NextResponse.json(
        { error: 'Kode discount sudah digunakan' },
        { status: 400 }
      );
    }

    const discount = await Discount.update(discountId, {
      code,
      name,
      description,
      type,
      value,
      maxUses,
      minPurchase,
      isActive,
      validUntil: validUntil ? new Date(validUntil) : null,
    });

    return NextResponse.json(discount);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update discount' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus discount
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const discountId = parseInt(params.id);
    
    await Discount.delete(discountId);

    return NextResponse.json({ message: 'Discount berhasil dihapus' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete discount' },
      { status: 500 }
    );
  }
}