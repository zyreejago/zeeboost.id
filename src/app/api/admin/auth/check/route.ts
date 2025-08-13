import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const adminAuth = await verifyAdminToken(request);
    
    if (!adminAuth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      admin: adminAuth.admin 
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}