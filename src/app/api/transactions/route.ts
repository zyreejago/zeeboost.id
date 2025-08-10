import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      gamepassVerified
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
          // Cek apakah kupon masih bisa digunakan
          if (discountRecord.maxUses > 0 && discountRecord.currentUses >= discountRecord.maxUses) {
            return NextResponse.json(
              { error: 'Kupon sudah mencapai batas penggunaan' },
              { status: 400 }
            );
          }
          
          // Update penggunaan kupon
          await prisma.discount.update({
            where: { id: discountRecord.id },
            data: { currentUses: { increment: 1 } }
          });
          appliedDiscount = discountRecord;
          console.log('Coupon applied:', appliedDiscount);
        }
      } catch (couponError) {
        console.error('Coupon processing error:', couponError);
        // Continue without coupon if there's an error
      }
    }
    
    // Get current robux price from settings
    let basePrice = 13500; // default fallback
    try {
      console.log('Getting robux price from settings...');
      const pricePerRobux = await prisma.settings.findUnique({
        where: { key: 'robux_price_per_100' }
      });
      
      if (pricePerRobux?.value) {
        basePrice = parseInt(pricePerRobux.value);
      }
      console.log('Base price:', basePrice);
    } catch (settingsError) {
      console.error('Settings error:', settingsError);
      // Continue with default price
    }
    
    const totalPrice = (robuxAmount / 100) * basePrice;
    console.log('Calculated total price:', totalPrice);
    
    // Create or find user
    let user;
    try {
      console.log('Creating/finding user...');
      const userData = {
        robloxUsername,
        robloxId: robloxId.toString() // Ensure it's a string
      };
      
      // Only add email if it's provided and valid
      if (email && email.trim()) {
        userData.email = email.trim();
      }
      
      console.log('User data:', userData);
      
      user = await prisma.user.upsert({
        where: { robloxUsername },
        update: {
          robloxId: robloxId.toString()
          // Don't update email in update to avoid conflicts
        },
        create: userData,
      });
      
      console.log('User created/found:', user.id);
    } catch (userError) {
      console.error('User creation error:', userError);
      throw new Error(`Failed to create/find user: ${userError.message}`);
    }
    
    // Create transaction
    let transaction;
    try {
      console.log('Creating transaction...');
      const transactionData = {
        userId: user.id,
        robuxAmount: parseInt(robuxAmount),
        totalPrice: Math.round(finalPrice || totalPrice),
        method: method.toString(),
        status: 'pending'
      };
      
      console.log('Transaction data:', transactionData);
      
      transaction = await prisma.transaction.create({
        data: transactionData,
        include: {
          user: true
        }
      });
      
      console.log('Transaction created successfully:', transaction.id);
    } catch (transactionError) {
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
    
  } catch (error) {
    console.error('=== Transaction API Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to create transaction', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}