import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
    });

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const user = data.data[0];
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.name,
          displayName: user.displayName,
          hasVerifiedBadge: user.hasVerifiedBadge,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Username not found' },
        { status: 404 }
      );
    }
  } catch (_error) {
    console.error('Error validating username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}