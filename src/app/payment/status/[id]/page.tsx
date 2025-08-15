'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PaymentStatusPage() {
  const params = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/transactions/check?id=${params.id}`);
        const data = await response.json();
        setTransaction(data);
        
        if (data.status === 'completed') {
          // Tampilkan notifikasi berhasil hanya ketika status benar-benar completed
          alert('Pembayaran berhasil! Robux akan segera ditambahkan ke akun Anda.');
        }
      } catch (_error) {
        console.error('Error checking payment status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
    
    // Check status setiap 5 detik
    const interval = setInterval(checkPaymentStatus, 5000);
    
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) return <div>Mengecek status pembayaran...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Status Pembayaran</h1>
        
        {transaction && (
          <div className="space-y-4">
            <div>
              <span className="font-medium">ID Transaksi:</span> {transaction.id}
            </div>
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {transaction.status === 'completed' ? 'Berhasil' :
                 transaction.status === 'pending' ? 'Menunggu Pembayaran' : 'Gagal'}
              </span>
            </div>
            <div>
              <span className="font-medium">Jumlah:</span> Rp {transaction.totalPrice?.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}