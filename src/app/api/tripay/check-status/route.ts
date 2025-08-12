import { NextRequest, NextResponse } from 'next/server';

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY || 'DEV-u12iianpoxG2rYzosjnMypHS6fTRIYH7dJbQ9fbj';
const TRIPAY_BASE_URL = 'https://tripay.co.id/api-sandbox';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Reference number diperlukan' },
        { status: 400 }
      );
    }

    console.log('Checking Tripay status for reference:', reference);

    const response = await fetch(
      `${TRIPAY_BASE_URL}/transaction/check-status?reference=${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${TRIPAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const tripayData = await response.json();
    
    console.log('Tripay response:', tripayData);

    if (tripayData.success) {
      // Mapping status dari Tripay ke format yang konsisten
      let normalizedStatus = 'UNKNOWN';
      const tripayStatus = tripayData.data?.status;
      
      // Handle berbagai format status dari Tripay
      if (tripayStatus === 'PAID' || tripayData.message?.includes('DIBAYAR')) {
        normalizedStatus = 'PAID';
      } else if (tripayStatus === 'UNPAID' || tripayData.message?.includes('BELUM DIBAYAR')) {
        normalizedStatus = 'UNPAID';
      } else if (tripayStatus === 'EXPIRED' || tripayData.message?.includes('EXPIRED')) {
        normalizedStatus = 'EXPIRED';
      } else if (tripayStatus === 'FAILED' || tripayData.message?.includes('GAGAL')) {
        normalizedStatus = 'FAILED';
      }
      
      return NextResponse.json({
        success: true,
        status: normalizedStatus,
        originalStatus: tripayStatus,
        message: tripayData.message,
        data: tripayData.data
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Gagal mengecek status transaksi', 
          message: tripayData.message 
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error checking Tripay status:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek status' },
      { status: 500 }
    );
  }
}