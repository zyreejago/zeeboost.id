import { NextRequest, NextResponse } from 'next/server';
import { validateRecaptcha } from '@/lib/recaptcha';
// ... existing imports ...

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { recaptchaToken, ...otherData } = requestBody;

    // Validasi reCAPTCHA terlebih dahulu
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'reCAPTCHA token is required' },
        { status: 400 }
      );
    }

    const recaptchaResult = await validateRecaptcha(recaptchaToken);
    
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // ... existing code untuk proses transaksi ...
    
  } catch (error) {
    console.error('Error in vialogin topup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}