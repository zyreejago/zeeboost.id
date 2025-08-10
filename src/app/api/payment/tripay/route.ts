import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const TRIPAY_API_KEY = 'DEV-u12iianpoxG2rYzosjnMypHS6fTRIYH7dJbQ9fbj';
const TRIPAY_PRIVATE_KEY = 'yEI0o-BzLEv-Cf7xV-hUH7Q-Oom7t';
const TRIPAY_MERCHANT_CODE = 'T44133';
const TRIPAY_BASE_URL = 'https://tripay.co.id/api-sandbox';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log('=== Tripay Payment API Called ===');
    console.log('Request body:', requestBody);
    
    const { transactionId, amount, customerName, customerEmail, customerPhone, paymentMethod = 'QRIS' } = requestBody;
    
    console.log('Extracted data:', {
      transactionId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod // Tambahkan ini untuk logging
    });
    
    if (!transactionId || !amount || !customerName || !customerEmail) {
      console.log('Validation failed:', {
        transactionId: !!transactionId,
        amount: !!amount,
        customerName: !!customerName,
        customerEmail: !!customerEmail
      });
      return NextResponse.json(
        { error: 'Data yang diperlukan tidak lengkap', received: requestBody },
        { status: 400 }
      );
    }

    const merchantRef = `ZB-${transactionId}-${Date.now()}`;
    
    const signature = crypto
      .createHmac('sha256', TRIPAY_PRIVATE_KEY)
      .update(TRIPAY_MERCHANT_CODE + merchantRef + amount)
      .digest('hex');

    const tripayData = {
      method: paymentMethod, // Gunakan metode pembayaran yang dipilih user
      merchant_ref: merchantRef,
      amount: amount,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || '',
      order_items: [{
        sku: `ROBUX-${transactionId}`,
        name: 'Top Up Robux ZeeBoost',
        price: amount,
        quantity: 1
      }],
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      expired_time: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      signature: signature
    };

    console.log('Sending to Tripay:', tripayData);

    const response = await fetch(`${TRIPAY_BASE_URL}/transaction/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tripayData)
    });

    const tripayResponse = await response.json();

    if (tripayResponse.success) {
      await prisma.transaction.update({
        where: { id: parseInt(transactionId) },
        data: {
          paymentProof: tripayResponse.data.reference,
          status: 'pending' // Ubah dari 'processing' ke 'pending'
        }
      });

      return NextResponse.json({
        success: true,
        paymentUrl: tripayResponse.data.checkout_url,
        reference: tripayResponse.data.reference,
        qrCode: tripayResponse.data.qr_url
      });
    } else {
      return NextResponse.json(
        { error: 'Gagal membuat pembayaran', details: tripayResponse.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Tripay payment error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat pembayaran', details: error.message },
      { status: 500 }
    );
  }
}