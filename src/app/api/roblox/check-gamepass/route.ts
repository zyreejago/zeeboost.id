import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, requiredPrice } = await request.json();

    if (!userId || !requiredPrice) {
      return NextResponse.json(
        { error: 'userId dan requiredPrice diperlukan' },
        { status: 400 }
      );
    }

    console.log(`Checking gamepass for userId ${userId} with required price ${requiredPrice}`);

    // Ambil semua gamepass user dari Roblox API
    const response = await fetch(
      `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=100&exclusiveStartId=`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch gamepass data:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Gagal mengambil data gamepass dari Roblox' },
        { status: 500 }
      );
    }

    const gamepassData = await response.json();
    console.log('Gamepass data received:', JSON.stringify(gamepassData, null, 2));
    
    // Daftar gamepass yang valid dengan harga yang sesuai
    const validGamepasses = [
      { robuxAmount: 100, requiredPrice: 143 },
      { robuxAmount: 200, requiredPrice: 286 },
      { robuxAmount: 300, requiredPrice: 429 },
      { robuxAmount: 400, requiredPrice: 572 },
      { robuxAmount: 500, requiredPrice: 715 },
      { robuxAmount: 600, requiredPrice: 858 },
      { robuxAmount: 700, requiredPrice: 1001 },
      { robuxAmount: 800, requiredPrice: 1144 },
      { robuxAmount: 900, requiredPrice: 1287 },
      { robuxAmount: 1000, requiredPrice: 1430 },
    ];

    // Cari gamepass yang sesuai dengan harga yang diminta
    const targetGamepass = validGamepasses.find(gp => gp.requiredPrice === requiredPrice);
    
    if (!targetGamepass) {
      return NextResponse.json(
        { error: 'Harga gamepass tidak valid' },
        { status: 400 }
      );
    }

    // Ambil username dari userId menggunakan Roblox API
    let username = '';
    try {
      const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        username = userData.name?.toLowerCase() || '';
        console.log(`Username for userId ${userId}: ${username}`);
      }
    } catch (userError) {
      console.error('Error fetching username:', userError);
    }

    // Cek apakah user memiliki gamepass dengan harga yang sesuai
    // Menggunakan logika: creator name harus sama dengan username dan harga harus tepat
    const matchingGamepass = gamepassData.gamePasses && gamepassData.gamePasses.find((gamepass: any) => {
      const creatorName = gamepass.creator?.name?.toLowerCase() || '';
      const gamepassPrice = gamepass.price;
      const isForSale = gamepass.isForSale;
      
      console.log(`Checking gamepass: ${gamepass.name}`);
      console.log(`- Creator: ${creatorName} vs User: ${username}`);
      console.log(`- Price: ${gamepassPrice} vs Required: ${requiredPrice}`);
      console.log(`- For Sale: ${isForSale}`);
      
      // Gamepass harus:
      // 1. Dibuat oleh user yang sama (creator name = username)
      // 2. Memiliki harga yang tepat sesuai requiredPrice
      // 3. Sedang dijual (isForSale = true)
      return creatorName === username && 
             gamepassPrice === requiredPrice && 
             isForSale === true;
    });

    const hasValidGamepass = !!matchingGamepass;

    if (hasValidGamepass) {
      console.log(`✅ Valid gamepass found: ${matchingGamepass.name} (ID: ${matchingGamepass.gamePassId})`);
    } else {
      console.log(`❌ No valid gamepass found for user ${username} with price ${requiredPrice}`);
    }

    return NextResponse.json({
      success: true,
      hasValidGamepass,
      requiredPrice,
      robuxAmount: targetGamepass.robuxAmount,
      gamepassDetails: hasValidGamepass ? {
        id: matchingGamepass.gamePassId,
        name: matchingGamepass.name,
        price: matchingGamepass.price,
        creator: matchingGamepass.creator.name
      } : null,
      message: hasValidGamepass 
        ? `✅ Gamepass terverifikasi: ${matchingGamepass.name} seharga ${requiredPrice} Robux untuk ${targetGamepass.robuxAmount} Robux`
        : `❌ Gamepass belum ditemukan. Pastikan kamu sudah membuat gamepass seharga ${requiredPrice} Robux dan sedang dijual.`,
      debug: {
        totalGamepasses: gamepassData.gamePasses?.length || 0,
        username: username,
        userId: userId,
        searchCriteria: {
          requiredPrice,
          targetRobux: targetGamepass.robuxAmount
        }
      }
    });

  } catch (error) {
    console.error('Error checking gamepass:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek gamepass' },
      { status: 500 }
    );
  }
}