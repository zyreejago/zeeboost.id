import { NextRequest, NextResponse } from 'next/server';
import { Discount } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';

// GET - Ambil semua diskon
export async function GET() {
  try {
    const discounts = await Discount.getAll();
    return NextResponse.json(discounts);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

// POST - Buat diskon baru
export async function POST(request: Request) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, name, description, type, value, maxUses, minPurchase, isActive, validUntil } = body;

    // Add timestamps
    const now = new Date();
    const discountData = {
      code,
      name,
      description: description || '',
      type,
      value: parseInt(value),
      maxUses: parseInt(maxUses) || 0,
      currentUses: 0,
      minPurchase: parseInt(minPurchase) || 0,
      isActive: Boolean(isActive),
      validUntil: validUntil || null,
      createdAt: now,
      updatedAt: now
    };

    const result = await Discount.create(discountData);
    return NextResponse.json({ success: true, discount: result });
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json(
      { error: 'Failed to create discount' },
      { status: 500 }
    );
  }
}