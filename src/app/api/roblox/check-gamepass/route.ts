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

    let hasValidGamepass = false;
    let gamepassDetails = null;
    let gamesData = null; // Pindahkan deklarasi ke scope yang lebih luas
    let totalGamesScanned = 0; // Tambahkan counter untuk games yang di-scan

    try {
      // Step 1: Dapatkan semua games yang dibuat oleh user
      const gamesResponse = await fetch(
        `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50&sortOrder=Asc`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ZeeBoost/1.0'
          },
        }
      );

      if (!gamesResponse.ok) {
        console.error('Failed to fetch user games:', gamesResponse.status);
        return NextResponse.json({
          success: false,
          hasValidGamepass: false,
          error: 'GAMES_NOT_FOUND',
          message: '❌ Tidak dapat mengakses games user.',
          userMessage: 'Pastikan profil games Anda bersifat public.'
        });
      }

      gamesData = await gamesResponse.json(); // Assign ke variabel yang sudah dideklarasikan
      totalGamesScanned = gamesData.data?.length || 0;
      console.log(`Found ${totalGamesScanned} games for user ${userId}`);

      if (!gamesData.data || gamesData.data.length === 0) {
        return NextResponse.json({
          success: false,
          hasValidGamepass: false,
          error: 'NO_GAMES_FOUND',
          message: '❌ User belum membuat game apapun.',
          userMessage: 'Anda belum memiliki game. Silakan buat game terlebih dahulu untuk membuat gamepass.'
        });
      }

      // Step 2: Cari gamepass di semua games user
      for (const game of gamesData.data) {
        const universeId = game.id;
        console.log(`Checking gamepasses for game: ${game.name} (Universe ID: ${universeId})`);

        try {
          const gamepassResponse = await fetch(
            `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100&sortOrder=Asc`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'ZeeBoost/1.0'
              },
            }
          );

          if (gamepassResponse.ok) {
            const gamepassData = await gamepassResponse.json();
            console.log(`Found ${gamepassData.data?.length || 0} gamepasses in game ${game.name}`);

            if (gamepassData.data && gamepassData.data.length > 0) {
              // Debug: Log struktur data gamepass yang sebenarnya
              console.log('=== GAMEPASS DATA DEBUG ===');
              console.log('Full gamepassData:', JSON.stringify(gamepassData, null, 2));
              console.log('First gamepass object:', JSON.stringify(gamepassData.data[0], null, 2));
              console.log('=== END DEBUG ===');
              
              // Cari gamepass dengan harga yang sesuai
              for (const gamepass of gamepassData.data) {
                console.log(`Checking gamepass: ${gamepass.name} - Price: ${gamepass.price}`);
                
                // Langsung cek harga tanpa API tambahan
                if (gamepass.price === requiredPrice) {
                  hasValidGamepass = true;
                  // Yang benar:
                  gamepassDetails = {
                    id: gamepass.id, // Ini adalah Gamepass ID (TargetId)
                    productId: gamepass.productId, // Simpan juga Product ID untuk referensi
                    name: gamepass.name,
                    price: gamepass.price,
                    creator: game.creator?.name || 'Unknown',
                    description: gamepass.description || '',
                    created: '',
                    sales: 0,
                    gamepassUrl: `https://www.roblox.com/game-pass/${gamepass.productId}/${gamepass.name?.replace(/\s+/g, '-').toLowerCase() || 'gamepass'}`,
                    gameName: game.name,
                    gameUrl: `https://www.roblox.com/games/${game.rootPlaceId}/${game.name?.replace(/\s+/g, '-').toLowerCase() || 'game'}`
                  };
                  console.log(`✅ Valid gamepass found: ${gamepass.name} (ID: ${gamepass.productId}) in game ${game.name}`);
                  break;
                }
              }
            }
          } else {
            console.error(`Failed to fetch gamepasses for game ${universeId}:`, gamepassResponse.status);
          }
        } catch (error) {
          console.error(`Error fetching gamepasses for game ${universeId}:`, error);
        }

        // Jika sudah menemukan gamepass yang valid, keluar dari loop
        if (hasValidGamepass) {
          break;
        }

        // Rate limiting - tunggu sebentar sebelum request berikutnya
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error('Error scanning user gamepasses:', error);
      return NextResponse.json({
        success: false,
        hasValidGamepass: false,
        error: 'SCAN_ERROR',
        message: '❌ Terjadi kesalahan saat mencari gamepass.',
        userMessage: 'Terjadi kesalahan sistem. Silakan coba lagi.'
      });
    }

    return NextResponse.json({
      success: true,
      hasValidGamepass,
      requiredPrice,
      robuxAmount: targetGamepass.robuxAmount,
      gamepassDetails,
      message: hasValidGamepass 
        ? `✅ Gamepass terverifikasi: ${gamepassDetails?.name} seharga ${requiredPrice} Robux untuk ${targetGamepass.robuxAmount} Robux di game ${gamepassDetails?.gameName}`
        : `❌ Gamepass belum ditemukan. Pastikan kamu sudah membuat gamepass seharga ${requiredPrice} Robux dan sedang dijual di salah satu game kamu.`,
      debug: {
        method: 'user_games_scan',
        userId: userId,
        searchCriteria: {
          requiredPrice,
          targetRobux: targetGamepass.robuxAmount
        },
        gamesScanned: totalGamesScanned // Gunakan variabel yang sudah dideklarasikan
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