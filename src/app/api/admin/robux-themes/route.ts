import { NextRequest, NextResponse } from 'next/server';
import { RobuxTheme } from '@/lib/models';
import { verifyAdminToken } from '@/lib/auth';

// GET - Ambil semua tema robux
export async function GET() {
  try {
    const themes = await RobuxTheme.getAll();
    return NextResponse.json(themes);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch robux themes' },
      { status: 500 }
    );
  }
}

// POST - Buat tema robux baru
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, robuxAmount, price, themeType, isPremium, order } = await request.json();

    const theme = await RobuxTheme.create({
      name,
      description,
      robuxAmount,
      price,
      themeType,
      isPremium: isPremium || false,
      isActive: true, // default active untuk tema baru
      order: order || 0
    });

    return NextResponse.json({ success: true, theme });
  } catch (_error) {
    console.error('Error creating theme:', _error);
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
  }
}

// PUT - Update tema robux
export async function PUT(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, description, robuxAmount, price, themeType, isPremium, order, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400 });
    }

    // Filter out undefined values
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (robuxAmount !== undefined) updateData.robuxAmount = robuxAmount;
    if (price !== undefined) updateData.price = price;
    if (themeType !== undefined) updateData.themeType = themeType;
    if (isPremium !== undefined) updateData.isPremium = isPremium;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedTheme = await RobuxTheme.update(id, updateData);

    return NextResponse.json({ success: true, theme: updatedTheme });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}

// DELETE - Hapus tema robux
export async function DELETE(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if theme exists
    const existingTheme = await RobuxTheme.findById(parseInt(id));
    if (!existingTheme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    // Delete the theme
    await RobuxTheme.delete(parseInt(id));

    return NextResponse.json({ success: true, message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Error deleting theme:', error);
    return NextResponse.json(
      { error: 'Failed to delete robux theme' },
      { status: 500 }
    );
  }
}