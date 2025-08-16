import { NextRequest, NextResponse } from 'next/server';
import { Transaction, User } from '@/lib/models';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { transactionId, amount, customerName, customerEmail, customerPhone, paymentMethod } = await request.json();
    
    // Validasi input
    if (!transactionId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Ambil data transaksi
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Pastikan variabel lingkungan tersedia
    const apiKey = process.env.TRIPAY_API_KEY;
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const merchantCode = process.env.TRIPAY_MERCHANT_CODE;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!apiKey || !privateKey || !merchantCode || !baseUrl) {
      console.error('Missing environment variables:', { 
        apiKey: !!apiKey, 
        privateKey: !!privateKey, 
        merchantCode: !!merchantCode, 
        baseUrl: !!baseUrl 
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Implementasi integrasi dengan Tripay
    try {
      // Generate unique merchant reference
      const timestamp = Date.now();
      const uniqueMerchantRef = `ZB-${transactionId}-${timestamp}`;
      
      // Generate signature
      const signatureString = merchantCode + uniqueMerchantRef + amount;
      const signature = crypto.createHmac('sha256', privateKey)
        .update(signatureString)
        .digest('hex');
      
      // Create the request payload
      const requestPayload = {
        method: paymentMethod,
        merchant_ref: uniqueMerchantRef, // ✅ Gunakan format yang lebih unik
        amount: amount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        order_items: [{
          name: `Robux ${transaction.robuxAmount}`,
          price: amount,
          quantity: 1
        }],
        callback_url: `${baseUrl}/api/webhook/tripay`,
        return_url: `${baseUrl}/payment/success?id=${transactionId}`,
        signature: signature
      };
      
      // Add debugging
      console.log('Tripay Request Payload:', JSON.stringify(requestPayload, null, 2));
      
      // Make the API call with the payload
      const tripayResponse = await fetch('https://tripay.co.id/api/transaction/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      
      // Add better error handling
      if (!tripayResponse.ok) {
        const errorText = await tripayResponse.text();
        console.error('Tripay API Error:', {
          status: tripayResponse.status,
          statusText: tripayResponse.statusText,
          response: errorText
        });
        throw new Error(`Tripay API returned ${tripayResponse.status}: ${tripayResponse.statusText}`);
      }
      
      // Check content type before parsing JSON
      const contentType = tripayResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await tripayResponse.text();
        console.error('Non-JSON response from Tripay:', responseText);
        throw new Error('Tripay API returned non-JSON response');
      }
      
      const tripayData = await tripayResponse.json();
      
      if (tripayData.success) {
        // Update transaction dengan reference dari Tripay DAN merchant_ref
        await Transaction.update(transactionId, {
          paymentReference: tripayData.data.reference,
          merchantRef: uniqueMerchantRef  // 🔥 TAMBAHKAN INI
        });
        
        return NextResponse.json({
          success: true,
          paymentUrl: tripayData.data.checkout_url,
          transaction: {
            ...transaction,
            paymentReference: tripayData.data.reference,
            merchantRef: uniqueMerchantRef,  // 🔥 TAMBAHKAN INI
            paymentUrl: tripayData.data.checkout_url
          }
        });
      } else {
        throw new Error(tripayData.message || 'Failed to create payment');
      }
    } catch (tripayError) {
      console.error('Tripay integration error:', tripayError);
      throw new Error(`Tripay integration failed: ${(tripayError as Error).message}`);
    }
  } catch (_error) {
    console.error('Payment API error:', _error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}