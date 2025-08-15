import { NextResponse } from 'next/server';

// Simple in-memory cache
let channelsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

export async function GET() {
  try {
    // Check cache first
    if (channelsCache && (Date.now() - channelsCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        channels: channelsCache.data,
        cached: true
      });
    }

    const apiKey = process.env.TRIPAY_API_KEY;
    
    console.log('API Key exists:', !!apiKey);
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'TRIPAY_API_KEY not configured in environment variables' },
        { status: 500 }
      );
    }

    // Menggunakan implementasi yang sama seperti contoh PHP kamu
    const response = await fetch('https://tripay.co.id/api/merchant/payment-channel', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Tambahan untuk debugging
      cache: 'no-cache'
    });

    console.log('Tripay API response status:', response.status);
    console.log('Tripay API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tripay API error response:', errorText);
      
      return NextResponse.json(
        { 
          error: `Tripay API error: ${response.status}`,
          details: errorText,
          success: false
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    // console.log('Tripay API success response:', {
    //   success: data.success,
    //   channelCount: data.data?.length || 0,
    //   channels: data.data?.map((ch: any) => ({ code: ch.code, name: ch.name, active: ch.active })) || []
    // });
    
    if (data.success && data.data) {
      // Perbaiki filter - hanya cek active saja
      const activeChannels = data.data.filter((channel: any) => 
        channel.active === true
      );
      
      console.log('Active channels found:', activeChannels.length);
      
      // Update cache
      channelsCache = {
        data: activeChannels,
        timestamp: Date.now()
      };
      
      return NextResponse.json({
        success: true,
        channels: activeChannels,
        total: activeChannels.length
      });
    } else {
      console.error('Tripay API returned unsuccessful response:', data);
      return NextResponse.json(
        { 
          error: data.message || 'Tripay API returned unsuccessful response',
          success: false,
          tripayResponse: data
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching payment channels:', error);
    
    // Return cached data if available, even if expired
    if (channelsCache) {
      console.log('Returning cached data due to error');
      return NextResponse.json({
        success: true,
        channels: channelsCache.data,
        cached: true,
        warning: 'Using cached data due to API error'
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch payment channels',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}