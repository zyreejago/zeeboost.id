import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

// GET - Ambil semua discounts
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(discounts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

// POST - Tambah discount baru
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, name, description, type, value, maxUses, minPurchase, isActive, validUntil } = await request.json();

    // Validasi kode discount unik
    const existingDiscount = await prisma.discount.findUnique({
      where: { code }
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: 'Kode discount sudah digunakan' },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.create({
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create discount' },
      { status: 500 }
    );
  }
}