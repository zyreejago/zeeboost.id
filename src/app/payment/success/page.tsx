'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Define the transaction interface
interface Transaction {
  id: string;
  status: string;
  robuxAmount?: number;
  // Add other properties as needed
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  
  const tripayReference = searchParams.get('tripay_reference');
  const merchantRef = searchParams.get('tripay_merchant_ref');

  useEffect(() => {
    const checkTransaction = async () => {
      if (merchantRef) {
        try {
          // Extract transaction ID from merchant reference (ZB-{transactionId}-{timestamp})
          const transactionId = merchantRef.split('-')[1]; // Ubah dari [2] ke [1]
          
          const response = await fetch(`/api/transactions/check?id=${transactionId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setTransaction(data.transaction); // Akses data.transaction
        } catch (_error) {
          console.error('Error fetching transaction:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkTransaction();
  }, [merchantRef]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memverifikasi pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h1>
          <p className="text-gray-600 mb-6">Terima kasih atas pembayaran Anda</p>
          
          {transaction && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2">Detail Transaksi:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ID Transaksi:</span>
                  <span className="font-mono">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Referensi Tripay:</span>
                  <span className="font-mono">{tripayReference}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-semibold">{transaction.status}</span>
                </div>
                {transaction.robuxAmount && (
                  <div className="flex justify-between">
                    <span>Robux:</span>
                    <span className="font-semibold">{transaction.robuxAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Link 
              href="/topup" 
              className="block w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Topup Lagi
            </Link>
            <Link 
              href="/" 
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}