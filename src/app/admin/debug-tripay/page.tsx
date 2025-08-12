'use client';

import { useState } from 'react';

interface TripayStatus {
  success: boolean;
  status?: string;
  message?: string;
  data?: any;
  error?: string;
}

interface TransactionData {
  success: boolean;
  transaction?: any;
  error?: string;
}

export default function DebugTripayPage() {
  const [reference, setReference] = useState('');
  const [tripayResult, setTripayResult] = useState<TripayStatus | null>(null);
  const [transactionResult, setTransactionResult] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!reference.trim()) {
      alert('Masukkan reference number!');
      return;
    }

    setLoading(true);
    try {
      // Check Tripay status
      const tripayResponse = await fetch(`/api/tripay/check-status?reference=${reference}`);
      const tripayData = await tripayResponse.json();
      setTripayResult(tripayData);

      // Check database transaction
      const dbResponse = await fetch(`/api/transactions/find-by-reference?reference=${reference}`);
      const dbData = await dbResponse.json();
      setTransactionResult(dbData);
      
    } catch (error) {
      console.error('Error:', error);
      setTripayResult({ success: false, error: 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async () => {
    if (!transactionResult?.transaction?.id) {
      alert('Tidak ada transaksi yang ditemukan!');
      return;
    }

    try {
      const response = await fetch('/api/admin/transactions/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          transactionId: transactionResult.transaction.id,
          status: 'processing'
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Status transaksi berhasil diupdate ke processing!');
        // Refresh data
        checkStatus();
      } else {
        alert('Gagal update status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Debug Tripay Status</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Reference Number:
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="DEV-T441332712660CB9E"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={checkStatus}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 mr-4"
          >
            {loading ? 'Checking...' : 'Cek Status'}
          </button>

          {transactionResult?.transaction && tripayResult?.status === 'PAID' && transactionResult.transaction.status === 'pending' && (
            <button
              onClick={updateTransactionStatus}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Update ke Processing
            </button>
          )}
        </div>

        {/* Tripay Status */}
        {tripayResult && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Status di Tripay:</h2>
            
            {tripayResult.success ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    tripayResult.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    tripayResult.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                    tripayResult.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tripayResult.status}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Message:</span>
                  <span className="ml-2">{tripayResult.message}</span>
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <p>❌ Error: {tripayResult.error || tripayResult.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Database Status */}
        {transactionResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Status di Database:</h2>
            
            {transactionResult.success ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Transaction ID:</span>
                  <span>{transactionResult.transaction.id}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    transactionResult.transaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    transactionResult.transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    transactionResult.transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transactionResult.transaction.status}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Username:</span>
                  <span className="ml-2">{transactionResult.transaction.user.robloxUsername}</span>
                </div>
                
                <div>
                  <span className="font-medium">Robux Amount:</span>
                  <span className="ml-2">{transactionResult.transaction.robuxAmount.toLocaleString()}</span>
                </div>
                
                <div>
                  <span className="font-medium">Total Price:</span>
                  <span className="ml-2">Rp {transactionResult.transaction.totalPrice.toLocaleString()}</span>
                </div>
                
                {/* Status Mismatch Warning */}
                {tripayResult?.status === 'PAID' && transactionResult.transaction.status === 'pending' && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
                    <p className="text-red-800 font-medium">
                      ⚠️ WEBHOOK TIDAK BERFUNGSI!
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      Tripay sudah PAID tapi database masih pending. Webhook tidak dipanggil atau gagal.
                    </p>
                  </div>
                )}
                
                {tripayResult?.status === 'PAID' && transactionResult.transaction.status === 'processing' && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
                    <p className="text-green-800 font-medium">
                      ✅ STATUS SINKRON!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Webhook berfungsi dengan baik. Transaksi siap diproses admin.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-600">
                <p>❌ Error: {transactionResult.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}