'use client';

export default function ViaLoginTopup() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-sign-in-alt text-gray-400 text-3xl"></i>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Topup via Login</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Fitur topup melalui login akun Roblox akan segera hadir!
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-blue-700">
            <i className="fas fa-info-circle"></i>
            <span className="text-sm font-medium">Sedang dalam tahap pengembangan</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          Sementara ini, silakan gunakan metode Gamepass untuk topup Robux Anda.
        </p>
      </div>
    </div>
  );
}