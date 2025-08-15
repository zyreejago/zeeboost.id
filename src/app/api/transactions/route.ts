import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';
import { User, Transaction, RobuxStock, Discount } from '@/lib/models';

// ❌ HAPUS method GET ini (baris 6-18)
// export async function GET(request: NextRequest) {
//   try {
//     const allTransactions = await Transaction.getAll();
//     const recentTransactions = allTransactions.slice(0, 10);
//     return NextResponse.json(recentTransactions);
//   } catch (error) {
//     console.error('Failed to fetch transactions:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch transactions' },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: NextRequest) {
  try {
    console.log('=== Transaction API Called ===');
    
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Request body:', requestBody);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Format data tidak valid' },
        { status: 400 }
      );
    }
    
    const { 
      robloxUsername, 
      robloxId, 
      robuxAmount, 
      method, 
      whatsappNumber, 
      email, 
      couponCode, 
      discount, 
      finalPrice,
      gamepassPrice,
      gamepassVerified,
      robloxPassword,
      isAliveVerification,
      backupCodes,
      robuxOptionType
    } = requestBody;
    
    // Validasi input yang diperlukan
    if (!robloxUsername || !robloxId || !robuxAmount || !method) {
      console.log('Validation failed:', { robloxUsername, robloxId, robuxAmount, method });
      return NextResponse.json(
        { error: 'Data yang diperlukan tidak lengkap' },
        { status: 400 }
      );
    }
    
    console.log('Validation passed, processing transaction...');
    
    // Validasi kupon jika ada
    let appliedDiscount = null;
    if (couponCode && couponCode.trim()) {
      try {
        console.log('Checking coupon:', couponCode);
        const discountRecord = await Discount.findByCode(couponCode.toUpperCase());
        
        if (discountRecord && discountRecord.isActive) {
          if (discountRecord.maxUses > 0 && discountRecord.currentUses >= discountRecord.maxUses) {
            return NextResponse.json(
              { error: 'Kupon sudah mencapai batas penggunaan' },
              { status: 400 }
            );
          }
          
          await Discount.update(discountRecord.id, { 
            currentUses: discountRecord.currentUses + 1 
          });
          appliedDiscount = discountRecord;
          console.log('Coupon applied:', appliedDiscount);
        }
      } catch (couponError) {
        console.error('Coupon processing error:', couponError);
        // Tidak throw error, lanjutkan tanpa kupon
      }
    }
    
    // Get current robux price from robux stock
    let basePrice = 0;
    let selectedRobuxStock = null;
    try {
      console.log('Getting robux price from stock...');
      
      // Pastikan robuxAmount adalah integer
      const robuxAmountInt = parseInt(robuxAmount);
      
      const robuxStock = await RobuxStock.findByAmount(robuxAmountInt);
      
      if (robuxStock) {
        basePrice = robuxStock.price;
        selectedRobuxStock = robuxStock;
        console.log(`Using price from stock for ${robuxAmountInt} Robux: ${basePrice}`);
      } else {
        const defaultStock = await RobuxStock.getActive();
        
        if (defaultStock && defaultStock.length > 0) {
          // Ambil stock dengan amount terkecil
          const smallestStock = defaultStock.sort((a, b) => a.amount - b.amount)[0];
          basePrice = Math.round((robuxAmountInt / smallestStock.amount) * smallestStock.price);
          selectedRobuxStock = smallestStock;
          console.log(`Calculated price based on ${smallestStock.amount} Robux stock: ${basePrice}`);
        } else {
          return NextResponse.json(
            { error: 'No active robux stock found' },
            { status: 500 }
          );
        }
      }
      
      console.log('Final base price:', basePrice);
    } catch (stockError) {
      console.error('Stock price error:', stockError);
      return NextResponse.json(
        { error: 'Harga Robux tidak tersedia. Silakan hubungi admin.' },
        { status: 500 }
      );
    }
    
    const totalPrice = basePrice;
    console.log('Calculated total price:', totalPrice);
    
    // Create or find user
    let user;
    try {
      console.log('Creating/finding user...');
      user = await User.findByRobloxUsername(robloxUsername);
      
      const userData = {
        robloxUsername,
        robloxId: robloxId.toString(),
        ...(email && email.trim() ? { email: email.trim() } : {}),
        ...(whatsappNumber && { whatsappNumber: whatsappNumber.trim() })
      };
      
      if (user) {
        // Update user jika sudah ada - ambil data terbaru setelah update
        await User.update(user.id, userData);
        user = await User.findById(user.id);
      } else {
        // Buat user baru jika belum ada
        user = await User.create(userData);
      }
      
      console.log('User created/found:', user.id);
    } catch (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: 'Gagal membuat/menemukan user' },
        { status: 500 }
      );
    }
    
    // Create transaction
    let transaction;
    try {
      console.log('Creating transaction...');
      
      let calculatedDiscount = 0;
      if (appliedDiscount) {
        if (appliedDiscount.type === 'percentage') {
          calculatedDiscount = Math.round(totalPrice * (appliedDiscount.value / 100));
        } else {
          calculatedDiscount = appliedDiscount.value;
        }
      } else if (discount) {
        calculatedDiscount = discount;
      }
      
      const now = new Date();
      const transactionData = {
        userId: user.id,
        robuxAmount: parseInt(robuxAmount),
        totalPrice: Math.round(totalPrice),
        finalPrice: Math.round(finalPrice || totalPrice),
        method: method.toString(),
        status: 'pending',
        robuxStockId: selectedRobuxStock?.id || null,
        couponCode: appliedDiscount ? appliedDiscount.code : (couponCode || null),
        discount: calculatedDiscount,
        createdAt: now,
        updatedAt: now,
        ...(method === 'vialogin' && {
          robloxPassword: robloxPassword || null,
          isAliveVerification: Boolean(isAliveVerification),
          backupCodes: backupCodes ? JSON.stringify(backupCodes) : null,
          robuxOptionType: robuxOptionType || null
        }),
        ...(method === 'gamepass' && gamepassVerified && {
          gamepassId: requestBody.gamepassId,
          gamepassUrl: requestBody.gamepassId ? `https://www.roblox.com/game-pass/${requestBody.gamepassId}` : null
        })
      };
      
      console.log('Transaction data:', transactionData);
      
      transaction = await Transaction.create(transactionData);
      
      // Ambil data user untuk digunakan di notifikasi
      transaction.user = user;
      
      console.log('Transaction created successfully:', transaction.id);
      
      // Kirim notifikasi Telegram untuk order via login
      if (method === 'vialogin') {
        try {
          await sendTelegramNotification({
            transactionId: transaction.id,
            robloxUsername: user.robloxUsername,
            robuxAmount: transaction.robuxAmount,
            totalPrice: transaction.totalPrice,
            method: transaction.method,
            status: transaction.status,
            whatsappNumber: user.whatsappNumber,
            createdAt: transaction.createdAt || new Date()
          });
        } catch (telegramError) {
          console.error('Failed to send Telegram notification:', telegramError);
          // Tidak perlu throw error untuk notifikasi Telegram
        }
      }
      
    } catch (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return NextResponse.json(
        { error: 'Gagal membuat transaksi' },
        { status: 500 }
      );
    }
    
    // Log informasi tambahan untuk debugging
    // console.log('Additional info:', {
    //   transactionId: transaction.id,
    //   whatsappNumber,
    //   gamepassPrice,
    //   gamepassVerified
    // });
    
    const response = {
      ...transaction,
      whatsappNumber,
      gamepassPrice,
      gamepassVerified
    };
    
    console.log('=== Transaction API Success ===');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('=== Transaction API Error ===');
    console.error('Error details:', error);
    console.error('Error message:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    
    // Return a proper error response
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

// ✅ GUNAKAN method GET ini (baris 279-313)
export async function GET(request: NextRequest) {
  try {
    const { db } = require('@/lib/db');
    
    const recentTransactions = await db.getMany(`
      SELECT t.*, 
             u.robloxUsername, 
             u.email, 
             u.whatsappNumber
      FROM Transaction t 
      LEFT JOIN User u ON t.userId = u.id 
      ORDER BY t.createdAt DESC 
      LIMIT 10
    `);
    
    const formattedTransactions = recentTransactions.map(row => ({
      ...row,
      user: {
        robloxUsername: row.robloxUsername,
        email: row.email,
        whatsappNumber: row.whatsappNumber
      }
    }));
    
    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}