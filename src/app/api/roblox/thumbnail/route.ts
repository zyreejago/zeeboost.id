import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false&thumbnailType=HeadShot`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch thumbnail');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (_error) {
    console._error('Error fetching thumbnail:', error);
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 });
  }
}