import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Dynamic import untuk logger dan models
const getLogger = async () => {
  try {
    const logger = await import('@/lib/logger');
    return logger.default;
  } catch (error) {
    console.error('Failed to import logger:', error);
    return null;
  }
};

const getTransactionModel = async () => {
  try {
    const models = await import('@/lib/models');
    return models.Transaction;
  } catch (error) {
    console.error('Failed to import Transaction model:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  const logger = await getLogger();
  
  if (logger) {
    logger.logRuntime('WEBHOOK_HEALTH_CHECK', {
      endpoint: '/api/webhook/tripay',
      method: 'GET'
    });
  }

  return NextResponse.json({
    status: 'OK',
    message: 'Webhook Tripay is ready',
    timestamp: new Date().toISOString(),
    endpoint: '/api/webhook/tripay',
    logging: logger ? 'enabled' : 'disabled'
  });
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let logger: any = null;
  
  try {
    // Load logger
    logger = await getLogger();
    
    if (logger) {
      logger.logRuntime('WEBHOOK_START', {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')
      });
      
      // Rotate logs jika perlu
      logger.rotateLogs();
    }

    // ✅ 1. PARSE PAYLOAD
    let payload: any;
    let rawBody = '';
    
    try {
      rawBody = await request.text();
      
      if (logger) {
        logger.logRequest(
          'POST',
          '/api/webhook/tripay',
          request.headers,
          rawBody
        );
      }
      
      if (!rawBody || rawBody.trim() === '') {
        return NextResponse.json({
          success: false,
          message: 'Empty request body'
        }, { status: 200 });
      }
      
      payload = JSON.parse(rawBody);
      
      if (logger) {
        logger.logWebhook('SUCCESS', 'Payload parsed successfully', {
          payloadKeys: Object.keys(payload),
          bodySize: rawBody.length
        });
      }
    } catch (parseError) {
      if (logger) {
        logger.logError(parseError as Error, 'PAYLOAD_PARSING');
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid JSON payload'
      }, { status: 200 });
    }
    
    // ✅ 2. EXTRACT HEADERS
    const callbackSignature = request.headers.get('x-callback-signature') || '';
    const callbackEvent = request.headers.get('x-callback-event') || '';
    
    if (logger) {
      logger.logWebhook('INFO', 'Headers extracted', {
        event: callbackEvent,
        hasSignature: !!callbackSignature,
        signatureLength: callbackSignature.length
      });
    }

    // ✅ 3. VALIDATE ENVIRONMENT
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    if (!privateKey) {
      if (logger) {
        logger.logWebhook('ERROR', 'TRIPAY_PRIVATE_KEY not configured');
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Configuration error'
      }, { status: 200 });
    }

    // ✅ 4. VALIDATE SIGNATURE (sesuai dokumentasi)
    if (callbackSignature) {
      try {
        const expectedSignature = crypto
          .createHmac('sha256', privateKey)
          .update(rawBody)
          .digest('hex');
        
        if (callbackSignature !== expectedSignature) {
          if (logger) {
            logger.logWebhook('ERROR', 'Invalid signature', {
              expected: expectedSignature,
              received: callbackSignature
            });
          }
          
          return NextResponse.json({ 
            success: false, 
            message: 'Invalid signature'
          }, { status: 200 });
        }
        
        if (logger) {
          logger.logWebhook('SUCCESS', 'Signature validated');
        }
      } catch (cryptoError) {
        if (logger) {
          logger.logError(cryptoError as Error, 'SIGNATURE_VALIDATION');
        }
        
        return NextResponse.json({ 
          success: false, 
          message: 'Signature validation failed'
        }, { status: 200 });
      }
    } else {
      if (logger) {
        logger.logWebhook('WARNING', 'No signature provided');
      }
    }

    // ✅ 5. VALIDATE EVENT (sesuai dokumentasi)
    if (callbackEvent !== 'payment_status') {
      if (logger) {
        logger.logWebhook('INFO', 'Unrecognized callback event', { event: callbackEvent });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: `Unrecognized callback event: ${callbackEvent}`
      }, { status: 200 });
    }

    // ✅ 6. VALIDATE CLOSED PAYMENT (sesuai dokumentasi)
    if (!payload || payload.is_closed_payment !== 1) {
      if (logger) {
        logger.logWebhook('INFO', 'Payment not closed', {
          isClosedPayment: payload?.is_closed_payment
        });
      }
      
      return NextResponse.json({ 
        success: false,
        message: 'Payment not closed'
      }, { status: 200 });
    }

    // ✅ 7. EXTRACT TRANSACTION DATA
    const { reference, merchant_ref, status, payment_method, total_amount, paid_at } = payload;
    
    if (!merchant_ref) {
      if (logger) {
        logger.logWebhook('ERROR', 'No merchant reference provided', {
          reference,
          merchant_ref
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'No merchant reference provided'
      }, { status: 200 });
    }

    // ✅ 8. LOAD TRANSACTION MODEL
    const Transaction = await getTransactionModel();
    if (!Transaction) {
      if (logger) {
        logger.logWebhook('ERROR', 'Failed to load Transaction model');
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Model loading failed'
      }, { status: 200 });
    }

    // ✅ 9. FIND TRANSACTION (sesuai dokumentasi)
    let transaction: any = null;
    
    try {
      // Cari berdasarkan merchant_ref terlebih dahulu
      transaction = await Transaction.findByReference(merchant_ref);
      
      // Jika tidak ditemukan dan merchant_ref adalah angka, coba cari berdasarkan ID
      if (!transaction && !isNaN(Number(merchant_ref))) {
        transaction = await Transaction.findById(parseInt(merchant_ref));
      }
      
      // Jika masih tidak ditemukan, coba cari berdasarkan reference Tripay
      if (!transaction && reference) {
        transaction = await Transaction.findByReference(reference);
      }
      
      if (logger) {
        logger.logWebhook('INFO', 'Transaction search result', {
          merchant_ref,
          reference,
          found: !!transaction,
          transactionId: transaction?.id
        });
      }
    } catch (dbError) {
      if (logger) {
        logger.logError(dbError as Error, 'DATABASE_SEARCH');
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Database error during transaction search'
      }, { status: 200 });
    }

    if (!transaction) {
      if (logger) {
        logger.logWebhook('ERROR', 'Transaction not found', {
          merchant_ref,
          reference
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: `Invoice not found or already paid: ${merchant_ref}`
      }, { status: 200 });
    }

    // ✅ 10. VALIDATE TRANSACTION STATUS
    if (transaction.status !== 'pending') {
      if (logger) {
        logger.logWebhook('INFO', 'Transaction already processed', {
          transactionId: transaction.id,
          currentStatus: transaction.status,
          paymentStatus: status
        });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Transaction already processed'
      }, { status: 200 });
    }

    // ✅ 11. PROCESS PAYMENT STATUS (sesuai dokumentasi)
    let newStatus = transaction.status;
    let updateData: any = {
      updatedAt: new Date()
    };
    
    switch (status.toUpperCase()) {
      case 'PAID':
        newStatus = 'processing';
        updateData.status = newStatus;
        updateData.paidAt = paid_at ? new Date(paid_at * 1000) : new Date();
        updateData.paymentMethod = payment_method;
        updateData.paymentReference = reference;
        break;
        
      case 'EXPIRED':
        newStatus = 'expired';
        updateData.status = newStatus;
        break;
        
      case 'FAILED':
        newStatus = 'failed';
        updateData.status = newStatus;
        break;
        
      default:
        if (logger) {
          logger.logWebhook('ERROR', 'Unrecognized payment status', { status });
        }
        
        return NextResponse.json({ 
          success: false, 
          message: 'Unrecognized payment status'
        }, { status: 200 });
    }

    // ✅ 12. UPDATE TRANSACTION
    try {
      await Transaction.update(transaction.id, updateData);
      
      if (logger) {
        logger.logWebhook('SUCCESS', 'Transaction updated successfully', {
          transactionId: transaction.id,
          oldStatus: transaction.status,
          newStatus: newStatus,
          paymentMethod: payment_method,
          totalAmount: total_amount
        });
      }
    } catch (updateError) {
      if (logger) {
        logger.logError(updateError as Error, 'TRANSACTION_UPDATE');
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update transaction'
      }, { status: 200 });
    }

    // ✅ 13. SUCCESS RESPONSE (sesuai dokumentasi)
    const processingTime = Date.now() - startTime;
    const successResponse = {
      success: true
    };

    if (logger) {
      logger.logResponse(200, successResponse, processingTime);
      logger.logRuntime('WEBHOOK_COMPLETED', {
        transactionId: transaction.id,
        oldStatus: transaction.status,
        newStatus: newStatus,
        processingTime,
        paymentMethod: payment_method
      });
    }

    return NextResponse.json(successResponse, { status: 200 });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (logger) {
      logger.logError(error as Error, 'WEBHOOK_FATAL_ERROR');
    }

    // Return error response sesuai dokumentasi
    const errorResponse = { 
      success: false, 
      message: (error as Error)?.message || 'Internal server error'
    };

    if (logger) {
      logger.logResponse(200, errorResponse, processingTime);
      logger.logRuntime('WEBHOOK_FAILED', {
        errorType: (error as Error)?.name,
        errorMessage: (error as Error)?.message,
        processingTime
      });
    }

    return NextResponse.json(errorResponse, { status: 200 });
  }
}