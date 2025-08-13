import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Transaction API Called ===');
    
    const requestBody = await request.json();
    console.log('Request body:', requestBody);
    
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
    if (couponCode) {
      try {
        console.log('Checking coupon:', couponCode);
        const discountRecord = await prisma.discount.findUnique({
          where: { code: couponCode.toUpperCase() }
        });
        
        if (discountRecord && discountRecord.isActive) {
          if (discountRecord.maxUses > 0 && discountRecord.currentUses >= discountRecord.maxUses) {
            return NextResponse.json(
              { error: 'Kupon sudah mencapai batas penggunaan' },
              { status: 400 }
            );
          }
          
          await prisma.discount.update({
            where: { id: discountRecord.id },
            data: { currentUses: { increment: 1 } }
          });
          appliedDiscount = discountRecord;
          console.log('Coupon applied:', appliedDiscount);
        }
      } catch (couponError) {
        console.error('Coupon processing error:', couponError);
      }
    }
    
    // Get current robux price from robux stock
    let basePrice = 0;
    let selectedRobuxStock = null;
    try {
      console.log('Getting robux price from stock...');
      
      const robuxStock = await prisma.robuxStock.findFirst({
        where: {
          amount: robuxAmount,
          isActive: true
        }
      });
      
      if (robuxStock) {
        basePrice = robuxStock.price;
        selectedRobuxStock = robuxStock;
        console.log(`Using price from stock for ${robuxAmount} Robux: ${basePrice}`);
      } else {
        const defaultStock = await prisma.robuxStock.findFirst({
          where: {
            isActive: true
          },
          orderBy: {
            amount: 'asc'
          }
        });
        
        if (defaultStock) {
          basePrice = Math.round((robuxAmount / defaultStock.amount) * defaultStock.price);
          selectedRobuxStock = defaultStock;
          console.log(`Calculated price based on ${defaultStock.amount} Robux stock: ${basePrice}`);
        } else {
          throw new Error('No active robux stock found');
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
      // Ganti baris 122
      const userData: {
        robloxUsername: string;
        robloxId: string;
        email?: string;
      } = {
        robloxUsername,
        robloxId: robloxId.toString()
      };
      
      if (email && email.trim()) {
        userData.email = email.trim();
      }
      
      console.log('User data:', userData);
      
      user = await prisma.user.upsert({
        where: { robloxUsername },
        update: {
          robloxId: robloxId.toString(),
          ...(whatsappNumber && { whatsappNumber: whatsappNumber.trim() })
        },
        create: {
          ...userData,
          ...(whatsappNumber && { whatsappNumber: whatsappNumber.trim() })
        },
      });
      
      console.log('User created/found:', user.id);
    } catch (_error) {
      console.error('User creation error:', _error);
      throw new Error(`Failed to create/find user: ${(_error as Error).message}`);
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
        ...(method === 'vialogin' && {
          robloxPassword: robloxPassword || null,
          isAliveVerification: isAliveVerification || false,
          backupCodes: backupCodes ? JSON.stringify(backupCodes) : null,
          robuxOptionType: robuxOptionType || null
        }),
        ...(method === 'gamepass' && gamepassVerified && {
          gamepassId: requestBody.gamepassId,
          gamepassUrl: requestBody.gamepassId ? `https://www.roblox.com/game-pass/${requestBody.gamepassId}` : null
        })
      };
      
      console.log('Transaction data:', transactionData);
      
      transaction = await prisma.transaction.create({
        data: transactionData,
        include: {
          user: true
        }
      });
      
      console.log('Transaction created successfully:', transaction.id);
      
      // Kirim notifikasi Telegram untuk order via login
      if (method === 'vialogin') {
        try {
          await sendTelegramNotification({
            transactionId: transaction.id,
            robloxUsername: transaction.user.robloxUsername,
            robuxAmount: transaction.robuxAmount,
            totalPrice: transaction.totalPrice,
            method: transaction.method,
            status: transaction.status,
            whatsappNumber: transaction.user.whatsappNumber,
            createdAt: transaction.createdAt
          });
        } catch (telegramError) {
          console.error('Failed to send Telegram notification:', telegramError);
        }
      }
      
    } catch (transactionError: Error) {
      console.error('Transaction creation error:', transactionError);
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }
    
    // Log informasi tambahan untuk debugging
    console.log('Additional info:', {
      transactionId: transaction.id,
      whatsappNumber,
      gamepassPrice,
      gamepassVerified
    });
    
    const response = {
      ...transaction,
      whatsappNumber,
      gamepassPrice,
      gamepassVerified
    };
    
    console.log('=== Transaction API Success ===');
    return NextResponse.json(response);
    
  } catch (_error: any) {
    console.error('=== Transaction API Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: true,
        robuxStock: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(transactions);
  } catch (_error) {
    console._error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}