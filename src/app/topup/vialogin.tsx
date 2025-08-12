'use client';

import { useState, useEffect } from 'react';
import RobuxSlider from '@/components/RobuxSlider';

interface RobloxUser {
  id: string;
  username: string;
  displayName: string;
  hasVerifiedBadge: boolean;
  avatarUrl?: string;
}

interface CouponData {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

interface RobuxOption {
  id: number;
  name: string;
  description?: string;
  robuxAmount: number;
  price: number;
  themeType: string;
  isPremium: boolean;
  order: number;
}

export default function ViaLoginTopup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [robloxUser, setRobloxUser] = useState<RobloxUser | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Verifikasi hidup
  const [isAliveVerification, setIsAliveVerification] = useState(false);
  const [backupCode1, setBackupCode1] = useState('');
  const [backupCode2, setBackupCode2] = useState('');
  const [backupCode3, setBackupCode3] = useState('');
  
  // Pilihan robux
  const [selectedRobuxOption, setSelectedRobuxOption] = useState<RobuxOption | null>(null);
  const [robuxOptions, setRobuxOptions] = useState<RobuxOption[]>([]);
  
  // Field lainnya
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  
  // Modal states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({} as any);
  
  // Settings
  const [canOrder, setCanOrder] = useState(true);
  
  useEffect(() => {
    fetchSettings();
    fetchRobuxOptions();
  }, []);
  
  // Auto-validate username
  useEffect(() => {
    if (username.trim().length > 2) {
      setIsValidating(true);
      setHasSearched(false);
      
      const timeoutId = setTimeout(() => {
        validateUsername();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setRobloxUser(null);
      setHasSearched(false);
      setIsValidating(false);
    }
  }, [username]);
  
  // Auto-validate coupon
  useEffect(() => {
    if (couponCode.trim().length >= 3) {
      setIsValidatingCoupon(true);
      setCouponError('');
      setCouponData(null);
      
      const timeoutId = setTimeout(() => {
        validateCoupon();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setCouponData(null);
      setCouponError('');
      setIsValidatingCoupon(false);
    }
  }, [couponCode]);
  
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setCanOrder(data.canOrder ?? true);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };
  
  const fetchRobuxOptions = async () => {
    try {
      const response = await fetch('/api/admin/robux-themes');
      const data = await response.json();
      
      if (data.success) {
        setRobuxOptions(data.themes);
      } else {
        console.error('Error fetching robux themes:', data.message);
        // Fallback ke data default jika API gagal
        const defaultOptions: RobuxOption[] = [
          { id: 1, name: 'Paket Hemat', robuxAmount: 100, price: 15000, themeType: 'small', isPremium: false, order: 1 },
          { id: 2, name: 'Paket Populer', robuxAmount: 500, price: 70000, themeType: 'regular', isPremium: false, order: 2 },
          { id: 3, name: 'Paket Premium', robuxAmount: 1000, price: 130000, themeType: 'premium', isPremium: true, order: 3 },
        ];
        setRobuxOptions(defaultOptions);
      }
    } catch (error) {
      console.error('Error fetching robux options:', error);
      // Fallback ke data default
      const defaultOptions: RobuxOption[] = [
        { id: 1, name: 'Paket Hemat', robuxAmount: 100, price: 15000, themeType: 'small', isPremium: false, order: 1 },
        { id: 2, name: 'Paket Populer', robuxAmount: 500, price: 70000, themeType: 'regular', isPremium: false, order: 2 },
        { id: 3, name: 'Paket Premium', robuxAmount: 1000, price: 130000, themeType: 'premium', isPremium: true, order: 3 },
      ];
      setRobuxOptions(defaultOptions);
    }
  };
  
  // Update validateUsername function untuk menambahkan avatar fetching
  const validateUsername = async () => {
    if (!username.trim()) return;
    
    try {
      const response = await fetch('/api/roblox/validate-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        try {
          const thumbnailResponse = await fetch(
            `/api/roblox/thumbnail?userId=${data.user.id}`
          );
          
          if (thumbnailResponse.ok) {
            const thumbnailData = await thumbnailResponse.json();
            
            let avatarUrl = '';
            if (thumbnailData.data && thumbnailData.data.length > 0 && thumbnailData.data[0].imageUrl) {
              avatarUrl = thumbnailData.data[0].imageUrl;
            } else {
              avatarUrl = `https://via.placeholder.com/48x48/10b981/ffffff?text=${data.user.username.charAt(0)}`;
            }
            
            setRobloxUser({ 
              ...data.user, 
              avatarUrl 
            });
          } else {
            setRobloxUser({ 
              ...data.user, 
              avatarUrl: `https://via.placeholder.com/48x48/10b981/ffffff?text=${data.user.username.charAt(0)}` 
            });
          }
        } catch (thumbnailError) {
          console.error('Error fetching thumbnail:', thumbnailError);
          setRobloxUser({ 
            ...data.user, 
            avatarUrl: `https://via.placeholder.com/48x48/10b981/ffffff?text=${data.user.username.charAt(0)}` 
          });
        }
      } else {
        setRobloxUser(null);
      }
      
      setHasSearched(true);
    } catch (error) {
      console.error('Error validating username:', error);
      setRobloxUser(null);
      setHasSearched(true);
    } finally {
      setIsValidating(false);
    }
  };
  
  const validateCoupon = async () => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCouponData(data.coupon);
        setCouponError('');
      } else {
        setCouponData(null);
        setCouponError(data.message || 'Kode kupon tidak valid');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Gagal memvalidasi kupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };
  
  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setModalData({ title, message, type });
    setShowNotificationModal(true);
  };
  
  const getDiscountAmount = () => {
    if (!couponData || !selectedRobuxOption) return 0;
    
    if (couponData.type === 'percentage') {
      return Math.round((selectedRobuxOption.price * couponData.discount) / 100);
    } else {
      return couponData.discount;
    }
  };
  
  const calculatePrice = () => {
    if (!selectedRobuxOption) return 0;
    return Math.max(0, selectedRobuxOption.price - getDiscountAmount());
  };
  
  const handleRobuxOptionSelect = (option: RobuxOption) => {
    if (option.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setSelectedRobuxOption(option);
  };
  
  const handlePremiumConfirm = () => {
    const premiumOption = robuxOptions.find(opt => opt.themeType === 'premium');
    if (premiumOption) {
      setSelectedRobuxOption(premiumOption);
    }
    setShowPremiumModal(false);
  };
  
  const formatWhatsAppNumber = (value: string) => {
    // Hapus semua karakter non-digit
    const numbers = value.replace(/\D/g, '');
    
    // Format dengan pola Indonesia
    if (numbers.startsWith('0')) {
      return numbers.replace(/^0/, '62');
    } else if (numbers.startsWith('62')) {
      return numbers;
    } else if (numbers.startsWith('8')) {
      return '62' + numbers;
    }
    
    return numbers;
  };
  
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsAppNumber(e.target.value);
    setWhatsappNumber(formatted);
  };
  
  const handleTopup = async () => {
    if (!robloxUser) {
      showNotification('Error', 'Silakan validasi username terlebih dahulu!', 'error');
      return;
    }
    
    if (!password.trim()) {
      showNotification('Error', 'Silakan masukkan password Roblox!', 'error');
      return;
    }
    
    if (!selectedRobuxOption) {
      showNotification('Error', 'Silakan pilih nominal Robux!', 'error');
      return;
    }
    
    if (isAliveVerification && (!backupCode1.trim() || !backupCode2.trim() || !backupCode3.trim())) {
      showNotification('Error', 'Silakan isi semua backup code untuk verifikasi hidup!', 'error');
      return;
    }
    
    if (!whatsappNumber.trim()) {
      showNotification('Error', 'Silakan masukkan nomor WhatsApp!', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const transactionData = {
        robloxUsername: robloxUser.username,
        robloxId: robloxUser.id,
        robloxPassword: password,
        robuxAmount: selectedRobuxOption.robuxAmount,
        method: 'vialogin',
        whatsappNumber: whatsappNumber.trim(),
        couponCode: couponCode.trim() || null,
        discount: getDiscountAmount(),
        finalPrice: calculatePrice(),
        isAliveVerification,
        backupCodes: isAliveVerification ? [backupCode1, backupCode2, backupCode3] : null,
        robuxOptionType: selectedRobuxOption.themeType
      };
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      
      const transaction = await response.json();
      
      if (response.ok) {
        const paymentData = {
          transactionId: transaction.id,
          amount: calculatePrice(),
          customerName: robloxUser.username,
          customerEmail: `${robloxUser.username}@roblox.com`,
          customerPhone: whatsappNumber.trim(),
          paymentMethod: paymentMethod
        };
        
        const paymentResponse = await fetch('/api/payment/tripay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        });
        
        const paymentResult = await paymentResponse.json();
        
        if (paymentResult.success) {
          window.open(paymentResult.paymentUrl, '_blank');
          showNotification('Info', `Transaksi berhasil dibuat! ID: ${transaction.id}. Silakan selesaikan pembayaran di tab yang baru dibuka.`, 'info');
          
          // Reset form
          setUsername('');
          setPassword('');
          setRobloxUser(null);
          setSelectedRobuxOption(null);
          setWhatsappNumber('');
          setCouponCode('');
          setCouponData(null);
          setIsAliveVerification(false);
          setBackupCode1('');
          setBackupCode2('');
          setBackupCode3('');
        } else {
          showNotification('Error', 'Gagal membuat pembayaran!', 'error');
        }
      } else {
        showNotification('Error', 'Gagal membuat transaksi!', 'error');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      showNotification('Error', 'Terjadi kesalahan!', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      {!canOrder && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-orange-500 mr-3"></i>
            <div>
              <h4 className="font-medium text-orange-800">Pesanan Sementara Ditutup</h4>
              <p className="text-sm text-orange-600 mt-1">Maaf, saat ini kami sedang tidak menerima pesanan baru. Silakan coba lagi nanti.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Topup via Login</h3>
        <p className="text-sm sm:text-base text-gray-600">Masukkan data akun Roblox Anda untuk memulai proses topup</p>
      </div>
      
      <div className="space-y-6">
        {/* Username Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username Roblox
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Roblox"
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>
          
          {/* Loading indicator untuk username */}
          {isValidating && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-blue-700 text-xs">Sedang mencari username...</span>
              </div>
            </div>
          )}
          
          {/* User Found */}
          {robloxUser && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <img 
                  src={robloxUser.avatarUrl} 
                  alt={robloxUser.username}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-green-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-green-800 text-sm sm:text-base">{robloxUser.displayName}</span>
                    {robloxUser.hasVerifiedBadge && (
                      <i className="fas fa-check-circle text-blue-500 text-xs sm:text-sm" title="Verified"></i>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-green-600">@{robloxUser.username}</p>
                </div>
                <i className="fas fa-check-circle text-green-500 text-lg sm:text-xl"></i>
              </div>
            </div>
          )}
          
          {/* User Not Found */}
          {hasSearched && !robloxUser && !isValidating && username.trim() && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                <span className="text-red-700 text-sm">Username tidak ditemukan</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Roblox
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password Roblox"
            className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        {/* Verifikasi Hidup Checkbox */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAliveVerification}
              onChange={(e) => setIsAliveVerification(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Verifikasi hidup?</span>
          </label>
          
          {isAliveVerification && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-600">
                Silakan isi 3 backup code Anda. 
                <a 
                  href="https://help.roblox.com/hc/en-us/articles/212459863" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  Cara buat backup code?
                </a>
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={backupCode1}
                  onChange={(e) => setBackupCode1(e.target.value)}
                  placeholder="Backup Code 1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={backupCode2}
                  onChange={(e) => setBackupCode2(e.target.value)}
                  placeholder="Backup Code 2"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={backupCode3}
                  onChange={(e) => setBackupCode3(e.target.value)}
                  placeholder="Backup Code 3"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Pilihan Nominal Robux */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pilih Nominal Robux
          </label>
          
         
          {/* Robux Small Section */}
          {robuxOptions.filter(option => option.themeType === 'small').length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                {/* <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">💰</span>
                </div> */}
                <h3 className="text-lg font-bold text-gray-800">Robux Small</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {robuxOptions
                  .filter(option => option.themeType === 'small')
                  .sort((a, b) => a.order - b.order)
                  .map((option) => (
                  <div
                  key={option.id}
                  onClick={() => handleRobuxOptionSelect(option)}
                  className={`group relative cursor-pointer transition-all duration-300 ${
                    selectedRobuxOption?.id === option.id ? "scale-105" : "hover:scale-102"
                  }`}
                >
                  <div
                    className={`relative bg-white rounded-2xl border-2 transition-all duration-300 ${
                      selectedRobuxOption?.id === option.id
                        ? "border-primary-400 shadow-xl shadow-primary-100"
                        : "border-gray-200 hover:border-primary-300 hover:shadow-lg"
                    }`}
                  >
                    {/* <div className="h-2 bg-primary-400 rounded-t-2xl"></div> */}

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center ">
                      <svg viewBox="0 0 38 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-[38px] sm:h-[40px]">
                        <rect width="37.7778" height="40" rx="6.66667" fill="#8B5CF6"></rect>
                        <path fillRule="evenodd" clipRule="evenodd" d="M28.4648 11.3901C30.1016 12.3381 31.111 14.091 31.111 15.9869V24.012C31.111 25.9089 30.1016 27.6608 28.4648 28.6088L21.5338 32.6223C19.8971 33.5703 17.8794 33.5703 16.2426 32.6223L9.3116 28.6088C7.67484 27.6608 6.6665 25.9089 6.6665 24.012V15.9869C6.6665 14.091 7.67484 12.3381 9.3116 11.3901L16.2426 7.3776C17.8794 6.42963 19.8971 6.42963 21.5338 7.3776L28.4648 11.3901ZM17.1705 9.19896L10.4208 13.1073C9.35743 13.7233 8.70354 14.8602 8.70354 16.0922V23.9078C8.70354 25.1387 9.35743 26.2767 10.4208 26.8926L17.1705 30.7999C18.2338 31.4159 19.5426 31.4159 20.6059 30.7999L27.3557 26.8926C28.419 26.2767 29.0739 25.1387 29.0739 23.9078V16.0922C29.0739 14.8602 28.419 13.7233 27.3557 13.1073L20.6059 9.19896C19.5426 8.58299 18.2338 8.58299 17.1705 9.19896ZM20.2994 11.383L25.6252 14.4659C26.4981 14.9715 27.0369 15.9062 27.0369 16.9186V23.0854C27.0369 24.0967 26.4981 25.0314 25.6252 25.5371L20.2994 28.621C19.4265 29.1267 18.3499 29.1267 17.4771 28.621L12.1512 25.5371C11.2784 25.0314 10.7406 24.0967 10.7406 23.0854V16.9186C10.7406 15.9062 11.2784 14.9715 12.1512 14.4659L17.4771 11.383C18.3499 10.8773 19.4265 10.8773 20.2994 11.383ZM15.8332 23.066H21.9443V16.9369H15.8332V23.066Z" fill="white"></path>
                      </svg>
                    </div>
                          <div>
                            <div className="text-xs text-primary-600 font-medium">SMALL</div>
                            <div className="text-sm font-bold text-gray-800">{option.robuxAmount} Robux</div>
                          </div>
                        </div>
                        {selectedRobuxOption?.id === option.id && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="text-center py-3 bg-primary-50 rounded-xl">
                        {/* <div className="text-xs text-primary-600 mb-1 font-medium">Harga PrSmaemium</div> */}
                        <div className="text-xl font-bold text-black-600">Rp {option.price.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
          
          {/* Robux Regular Section */}
          {robuxOptions.filter(option => option.themeType === 'regular').length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {/* <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">🔥</span>
                </div> */}
                <h3 className="text-lg font-bold text-gray-800">Robux Regular</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {robuxOptions
                  .filter(option => option.themeType === 'regular')
                  .sort((a, b) => a.order - b.order)
                  .map((option) => (
                    <div
                  key={option.id}
                  onClick={() => handleRobuxOptionSelect(option)}
                  className={`group relative cursor-pointer transition-all duration-300 ${
                    selectedRobuxOption?.id === option.id ? "scale-105" : "hover:scale-102"
                  }`}
                >
                  <div
                    className={`relative bg-white rounded-2xl border-2 transition-all duration-300 ${
                      selectedRobuxOption?.id === option.id
                        ? "border-primary-400 shadow-xl shadow-primary-100"
                        : "border-gray-200 hover:border-primary-300 hover:shadow-lg"
                    }`}
                  >
                    {/* <div className="h-2 bg-primary-400 rounded-t-2xl"></div> */}

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center ">
                      <svg viewBox="0 0 38 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-[38px] sm:h-[40px]">
                        <rect width="37.7778" height="40" rx="6.66667" fill="#8B5CF6"></rect>
                        <path fillRule="evenodd" clipRule="evenodd" d="M28.4648 11.3901C30.1016 12.3381 31.111 14.091 31.111 15.9869V24.012C31.111 25.9089 30.1016 27.6608 28.4648 28.6088L21.5338 32.6223C19.8971 33.5703 17.8794 33.5703 16.2426 32.6223L9.3116 28.6088C7.67484 27.6608 6.6665 25.9089 6.6665 24.012V15.9869C6.6665 14.091 7.67484 12.3381 9.3116 11.3901L16.2426 7.3776C17.8794 6.42963 19.8971 6.42963 21.5338 7.3776L28.4648 11.3901ZM17.1705 9.19896L10.4208 13.1073C9.35743 13.7233 8.70354 14.8602 8.70354 16.0922V23.9078C8.70354 25.1387 9.35743 26.2767 10.4208 26.8926L17.1705 30.7999C18.2338 31.4159 19.5426 31.4159 20.6059 30.7999L27.3557 26.8926C28.419 26.2767 29.0739 25.1387 29.0739 23.9078V16.0922C29.0739 14.8602 28.419 13.7233 27.3557 13.1073L20.6059 9.19896C19.5426 8.58299 18.2338 8.58299 17.1705 9.19896ZM20.2994 11.383L25.6252 14.4659C26.4981 14.9715 27.0369 15.9062 27.0369 16.9186V23.0854C27.0369 24.0967 26.4981 25.0314 25.6252 25.5371L20.2994 28.621C19.4265 29.1267 18.3499 29.1267 17.4771 28.621L12.1512 25.5371C11.2784 25.0314 10.7406 24.0967 10.7406 23.0854V16.9186C10.7406 15.9062 11.2784 14.9715 12.1512 14.4659L17.4771 11.383C18.3499 10.8773 19.4265 10.8773 20.2994 11.383ZM15.8332 23.066H21.9443V16.9369H15.8332V23.066Z" fill="white"></path>
                      </svg>
                    </div>
                          <div>
                            <div className="text-xs text-primary-600 font-medium">REGULAR</div>
                            <div className="text-sm font-bold text-gray-800">{option.robuxAmount} Robux</div>
                          </div>
                        </div>
                        {selectedRobuxOption?.id === option.id && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="text-center py-3 bg-primary-50 rounded-xl">
                        {/* <div className="text-xs text-primary-600 mb-1 font-medium">Harga Premium</div> */}
                        <div className="text-xl font-bold text-black-600">Rp {option.price.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
          
         {/* Robux Premium Section */}
          {robuxOptions.filter(option => option.themeType === 'premium').length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-4">
                {/* <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">💎</span>
                </div> */}
                <h3 className="text-lg font-bold text-gray-800">Robux Premium</h3>
              </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {robuxOptions
              .filter((option) => option.themeType === "premium")
              .sort((a, b) => a.order - b.order)
              .map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleRobuxOptionSelect(option)}
                  className={`group relative cursor-pointer transition-all duration-300 ${
                    selectedRobuxOption?.id === option.id ? "scale-105" : "hover:scale-102"
                  }`}
                >
                  <div
                    className={`relative bg-white rounded-2xl border-2 transition-all duration-300 ${
                      selectedRobuxOption?.id === option.id
                        ? "border-primary-400 shadow-xl shadow-primary-100"
                        : "border-gray-200 hover:border-primary-300 hover:shadow-lg"
                    }`}
                  >
                    {/* <div className="h-2 bg-primary-400 rounded-t-2xl"></div> */}

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center ">
                      <svg viewBox="0 0 38 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-[38px] sm:h-[40px]">
                        <rect width="37.7778" height="40" rx="6.66667" fill="#8B5CF6"></rect>
                        <path fillRule="evenodd" clipRule="evenodd" d="M28.4648 11.3901C30.1016 12.3381 31.111 14.091 31.111 15.9869V24.012C31.111 25.9089 30.1016 27.6608 28.4648 28.6088L21.5338 32.6223C19.8971 33.5703 17.8794 33.5703 16.2426 32.6223L9.3116 28.6088C7.67484 27.6608 6.6665 25.9089 6.6665 24.012V15.9869C6.6665 14.091 7.67484 12.3381 9.3116 11.3901L16.2426 7.3776C17.8794 6.42963 19.8971 6.42963 21.5338 7.3776L28.4648 11.3901ZM17.1705 9.19896L10.4208 13.1073C9.35743 13.7233 8.70354 14.8602 8.70354 16.0922V23.9078C8.70354 25.1387 9.35743 26.2767 10.4208 26.8926L17.1705 30.7999C18.2338 31.4159 19.5426 31.4159 20.6059 30.7999L27.3557 26.8926C28.419 26.2767 29.0739 25.1387 29.0739 23.9078V16.0922C29.0739 14.8602 28.419 13.7233 27.3557 13.1073L20.6059 9.19896C19.5426 8.58299 18.2338 8.58299 17.1705 9.19896ZM20.2994 11.383L25.6252 14.4659C26.4981 14.9715 27.0369 15.9062 27.0369 16.9186V23.0854C27.0369 24.0967 26.4981 25.0314 25.6252 25.5371L20.2994 28.621C19.4265 29.1267 18.3499 29.1267 17.4771 28.621L12.1512 25.5371C11.2784 25.0314 10.7406 24.0967 10.7406 23.0854V16.9186C10.7406 15.9062 11.2784 14.9715 12.1512 14.4659L17.4771 11.383C18.3499 10.8773 19.4265 10.8773 20.2994 11.383ZM15.8332 23.066H21.9443V16.9369H15.8332V23.066Z" fill="white"></path>
                      </svg>
                    </div>
                          <div>
                            <div className="text-xs text-primary-600 font-medium">PREMIUM</div>
                            <div className="text-sm font-bold text-gray-800">{option.robuxAmount} Robux</div>
                          </div>
                        </div>
                        {selectedRobuxOption?.id === option.id && (
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="text-center py-3 bg-primary-50 rounded-xl">
                        <div className="text-xs text-primary-600 mb-1 font-medium">Harga Premium</div>
                        <div className="text-xl font-bold text-black-600">Rp {option.price.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
            </div>
          )}
        
        {/* WhatsApp Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor WhatsApp
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">+</span>
            </div>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={handleWhatsAppChange}
              placeholder="628123456789"
              className="w-full pl-8 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Format: 628xxxxxxxxx (tanpa tanda +)
          </p>
        </div>
        
        {/* Coupon Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kode Kupon (Opsional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode kupon"
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            />
            {isValidatingCoupon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            )}
          </div>
          
          {isValidatingCoupon && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary-500 border-t-transparent"></div>
                <span className="text-blue-700 text-xs">Sedang memvalidasi kupon...</span>
              </div>
            </div>
          )}
          
          {couponData && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <i className="fas fa-check-circle text-green-500"></i>
                <span className="text-green-700 text-sm font-medium">
                  Kupon berhasil diterapkan! Diskon {couponData.type === 'percentage' ? `${couponData.discount}%` : `Rp ${couponData.discount.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>
          )}
          
          {couponError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                <span className="text-red-700 text-sm">{couponError}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metode Pembayaran
          </label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
          >
            <option value="QRIS">QRIS (Semua E-Wallet)</option>
            <option value="BRIVA">BRI Virtual Account</option>
            <option value="BNIVA">BNI Virtual Account</option>
            <option value="BSIVA">BSI Virtual Account</option>
            <option value="MANDIRIVA">Mandiri Virtual Account</option>
            <option value="PERMATAVA">Permata Virtual Account</option>
            <option value="ALFAMART">Alfamart</option>
            <option value="INDOMARET">Indomaret</option>
          </select>
        </div>
        
        {/* Price Summary */}
        {selectedRobuxOption && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Harga Dasar ({selectedRobuxOption.robuxAmount} Robux)</span>
              <span className="font-medium">Rp {selectedRobuxOption.price.toLocaleString('id-ID')}</span>
            </div>
            
            {couponData && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600">Diskon ({couponData.code})</span>
                <span className="font-medium text-green-600">-Rp {getDiscountAmount().toLocaleString('id-ID')}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total Harga</span>
                <span className="font-bold text-lg text-primary-600">Rp {calculatePrice().toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          onClick={handleTopup}
          disabled={!robloxUser || !password.trim() || !selectedRobuxOption || !whatsappNumber.trim() || isLoading || !canOrder}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Memproses...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <i className="fas fa-shopping-cart"></i>
              <span>Pesan Sekarang</span>
            </div>
          )}
        </button>
        
        {/* Product Description */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-800 mb-3">Deskripsi Produk</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• Tentukan Nominal Robux yang diinginkan</p>
            <p>• Input Username dan Password akun Roblox Anda</p>
            <p>• Tentukan Jumlah Pembelian sesuai kebutuhan</p>
            <p>• Pilih Metode Pembayaran yang tersedia</p>
            <p>• Input Kode Promo jika tersedia</p>
            <p>• Isi Detail Kontak dengan benar (Pastikan nomor WhatsApp sudah tepat!)</p>
            <p>• Klik Pesan Sekarang dan lakukan Pembayaran</p>
            <p>• Pesanan akan diproses berdasarkan urutan antrian</p>
            <p>• Selesai</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">Informasi Tambahan Khusus Produk Roblox:</h5>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Pesanan Anda diproses sesuai urutan antrian, bisa sangat cepat atau sedikit lama tergantung banyaknya antrian saat pembelian!</p>
              <p>• Jangan khawatir, pesanan Anda pasti akan diproses, tidak perlu spam chat ya!</p>
              <p>• Sambil menunggu antrian, Anda boleh login dan bermain game, tidak akan bentrok.</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              • Jam operasional admin VIA LOGIN: 07:00 Pagi - 00:00 (dini hari/malam hari)
            </p>
            <p className="text-sm text-blue-700">
              • Order di atas jam 00:00 akan mulai diproses pagi hari pada awal jam kerja/07:00 WIB (sesuai urutan pesanan)
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h5 className="font-medium text-blue-800 mb-2">Mengalami Kendala/Error?</h5>
            <p className="text-sm text-blue-700">
              Silakan Klik untuk menghubungi Admin 👉 
              <a href="#" className="text-blue-600 hover:text-blue-800 underline ml-1">Hubungi Admin</a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Modal Premium Warning */}
      {showPremiumModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 text-primary-600">Peringatan Roblox Premium</h3>
              
              <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  Produk ini hanya bisa dibeli <strong>1x per akun</strong> dalam sebulan, dan pastikan akun Roblox kamu sedang <strong>tidak berlangganan Premium!</strong>
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handlePremiumConfirm}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Paham
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                modalData.type === 'success' ? 'bg-green-100' :
                modalData.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <i className={`fas ${
                  modalData.type === 'success' ? 'fa-check text-green-500' :
                  modalData.type === 'error' ? 'fa-times text-red-500' : 'fa-info text-blue-500'
                } text-xl`}></i>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{modalData.title}</h3>
              <p className="text-gray-600 mb-6">{modalData.message}</p>
              
              <button
                onClick={() => setShowNotificationModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
