import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();
    
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    // Ambil data transaksi
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Cek apakah transaksi masih pending
    if (transaction.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Transaction not eligible for retry',
        currentStatus: transaction.status 
      }, { status: 400 });
    }

    // Cek apakah ada paymentReference
    if (!transaction.paymentReference) {
      return NextResponse.json({ 
        error: 'No payment reference found for this transaction' 
      }, { status: 400 });
    }

    // Cek status di Tripay untuk validasi expired_time
    try {
      const tripayResponse = await fetch(
        `https://tripay.co.id/api/transaction/detail?reference=${transaction.paymentReference}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TRIPAY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const tripayData = await tripayResponse.json();
      
      if (tripayData.success && tripayData.data) {
        const expiredTime = new Date(tripayData.data.expired_time * 1000);
        const now = new Date();
        
        // Jika sudah expired di Tripay, update status dan tolak retry
        if (now > expiredTime) {
          await Transaction.update(transactionId, { status: 'expired' });
          return NextResponse.json({ 
            error: 'Payment time has expired',
            expiredAt: expiredTime.toISOString()
          }, { status: 400 });
        }
        
        // Jika masih valid, return URL checkout
        const checkoutUrl = `https://tripay.co.id/checkout/${transaction.paymentReference}`;
        
        return NextResponse.json({
          success: true,
          paymentUrl: checkoutUrl,
          expiresAt: expiredTime.toISOString(),
          reference: transaction.paymentReference,
          message: 'Payment URL ready'
        });
      }
    } catch (tripayError) {
      console.error('Error checking Tripay status:', tripayError);
      // Jika gagal cek status, tetap return URL checkout (fallback)
    }

    // Fallback: return URL checkout langsung jika gagal cek status
    const checkoutUrl = `https://tripay.co.id/checkout/${transaction.paymentReference}`;
    
    return NextResponse.json({
      success: true,
      paymentUrl: checkoutUrl,
      reference: transaction.paymentReference,
      message: 'Payment URL ready (fallback)'
    });
    
  } catch (error) {
    console.error('Payment retry error:', error);
    return NextResponse.json(
      { error: 'Failed to retry payment' },
      { status: 500 }
    );
  }
}