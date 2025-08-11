import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const TRIPAY_PRIVATE_KEY = 'yEI0o-BzLEv-Cf7xV-hUH7Q-Oom7t';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callbackSignature = request.headers.get('x-callback-signature');
    
    const signature = crypto
      .createHmac('sha256', TRIPAY_PRIVATE_KEY)
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== callbackSignature) {
      console.error('Invalid signature from Tripay webhook');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { reference, status, merchant_ref, amount } = body;
    
    const transactionId = merchant_ref.split('-')[1];
    
    if (!transactionId) {
      console.error('Invalid merchant_ref format:', merchant_ref);
      return NextResponse.json({ error: 'Invalid merchant_ref' }, { status: 400 });
    }

    let newStatus = 'pending';
    
    switch (status) {
      case 'PAID':
        newStatus = 'completed';  // ✅ Success/Selesai
        break;
      case 'EXPIRED':
      case 'FAILED':
        newStatus = 'failed';     // ❌ Gagal
        break;
      case 'UNPAID':
        newStatus = 'processing'; // 🔄 Sudah bayar, sedang diproses
        break;
      default:
        newStatus = 'pending';    // ⏳ Belum bayar
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(transactionId) },
      data: {
        status: newStatus,
        paymentProof: reference
      },
      include: {
        user: true
      }
    });

    console.log(`Transaction ${transactionId} updated to status: ${newStatus}`);
    
    if (newStatus === 'completed') {
      console.log(`Payment completed for transaction ${transactionId}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Tripay webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}