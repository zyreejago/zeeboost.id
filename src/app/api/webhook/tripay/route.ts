import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const TRIPAY_PRIVATE_KEY = process.env.TRIPAY_PRIVATE_KEY || 'yEI0o-BzLEv-Cf7xV-hUH7Q-Oom7t';

export async function POST(request: NextRequest) {
  try {
    // Ambil raw body sebagai text, bukan JSON
    const rawBody = await request.text();
    const callbackSignature = request.headers.get('x-callback-signature');
    
    console.log('Webhook received:', {
      signature: callbackSignature,
      bodyLength: rawBody.length
    });
    
    // Verifikasi signature dengan raw body
    const signature = crypto
      .createHmac('sha256', TRIPAY_PRIVATE_KEY)
      .update(rawBody)
      .digest('hex');

    if (signature !== callbackSignature) {
      console.error('Invalid signature:', {
        expected: signature,
        received: callbackSignature
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse JSON setelah verifikasi signature
    const body = JSON.parse(rawBody);
    const { reference, status, merchant_ref, amount } = body;
    
    console.log('Webhook data:', { reference, status, merchant_ref, amount });
    
    // Extract transaction ID dari merchant_ref format: ZB-{transactionId}-{timestamp}
    const merchantRefParts = merchant_ref.split('-');
    if (merchantRefParts.length < 2 || merchantRefParts[0] !== 'ZB') {
      console.error('Invalid merchant_ref format:', merchant_ref);
      return NextResponse.json({ error: 'Invalid merchant_ref format' }, { status: 400 });
    }
    
    const transactionId = merchantRefParts[1];
    
    if (!transactionId || isNaN(parseInt(transactionId))) {
      console.error('Invalid transaction ID:', transactionId);
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    // Mapping status Tripay ke status internal
    let newStatus = 'pending';
    
    switch (status) {
      case 'PAID':
        newStatus = 'processing';  // Paid, siap diproses admin
        break;
      case 'EXPIRED':
      case 'FAILED':
        newStatus = 'failed';     // Gagal/expired
        break;
      case 'UNPAID':
        newStatus = 'pending';    // Belum bayar
        break;
      default:
        console.warn('Unknown status from Tripay:', status);
        newStatus = 'pending';
    }

    // Update transaction di database
    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(transactionId) },
      data: {
        status: newStatus,
        paymentProof: reference,
        updatedAt: new Date()
      },
      include: {
        user: true
      }
    });

    console.log(`✅ Transaction ${transactionId} updated:`, {
      oldStatus: 'pending',
      newStatus: newStatus,
      reference: reference
    });
    
    // Log untuk monitoring
    if (newStatus === 'processing') {
      console.log(`💰 Payment completed for transaction ${transactionId}, ready for admin processing`);
    } else if (newStatus === 'failed') {
      console.log(`❌ Payment failed for transaction ${transactionId}`);
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      transactionId: transactionId,
      newStatus: newStatus
    });
    
  } catch (error) {
    console.error('❌ Tripay webhook error:', error);
    
    // Jika error parsing JSON atau database
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}