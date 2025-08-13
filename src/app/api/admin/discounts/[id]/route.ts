import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const existingDiscount = await prisma.discount.findFirst({
      where: {
        code,
        NOT: { id: discountId }
      }
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: 'Kode discount sudah digunakan' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.update({
      where: { id: discountId },
      data: {
        code,
        name,
        description,
        type,
        value,
        maxUses,
        minPurchase,
        isActive,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
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
    
    await prisma.discount.delete({
      where: { id: discountId },
    });

    return NextResponse.json({ message: 'Discount berhasil dihapus' });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete discount' },
      { status: 500 }
    );
  }
}