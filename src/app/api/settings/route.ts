import { NextRequest, NextResponse } from 'next/server';
import { Settings } from '@/lib/models';

export async function GET() {
  try {
    const settings = await Settings.getAll();
    const settingsObj = settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(settingsObj);
  } catch (_error) {
    console.error('Get settings error:', _error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value, description } = await request.json();
    
    const setting = await Settings.update(key, value);
    
    return NextResponse.json(setting);
  } catch (_error) {
    console.error('Update setting error:', _error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}