'use client';

import { useState, useEffect, useRef } from 'react';
import RobuxSlider from '@/components/RobuxSlider';
import Image from 'next/image';
import ReCaptcha from '@/components/ReCaptcha';


interface RobuxStockItem {
  id: number;
  amount: number;
  price: number;
  isActive: boolean;
  name?: string;
  allowOrders?: boolean;
}

interface GamepassDetails {
  id?: number;
  name?: string;
  price?: number;
  creatorName?: string;
  isVerified?: boolean;
}

// Tambahkan deklarasi tipe untuk window
declare global {
  interface Window {
    gamepassDetails?: {
      id: string;
      name: string;
      price: number;
      creator: string;
    };
  }
}

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

export default function GamepassTopup() {
  const [robuxAmount, setRobuxAmount] = useState(100);
  const [username, setUsername] = useState('');
  const [robloxUser, setRobloxUser] = useState<RobloxUser | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [robuxPrice, setRobuxPrice] = useState(13500);
  const [isLoading, setIsLoading] = useState(false);
  
  // Field baru yang ditambahkan
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  // Tambahkan state untuk metode pembayaran
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  
  // Tambahkan state untuk robux stock
  const [robuxStock, setRobuxStock] = useState<RobuxStockItem[]>([]);
  
  const [gamepassStep, setGamepassStep] = useState<'create' | 'verify' | 'completed'>('create');
  const [requiredGamepassPrice, setRequiredGamepassPrice] = useState(0);
  const [isCheckingGamepass, setIsCheckingGamepass] = useState(false);
  const [gamepassVerified, setGamepassVerified] = useState(false);
  
  // Tambahkan state untuk modal
  const [showGamepassModal, setShowGamepassModal] = useState(false);
  
  // Tambahkan state baru untuk modal konfirmasi dan notifikasi
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Tambahkan state baru untuk modal delivery information
const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
    gamepassDetails?: GamepassDetails;
    robuxAmount?: number;
    totalPrice?: number;
  }>({} as any);
  
  // Tambahkan state untuk reCAPTCHA
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [recaptchaError, setRecaptchaError] = useState<string>('');
  const recaptchaRef = useRef<any>(null);
  
  useEffect(() => {
    fetchSettings();
    fetchPaymentChannels();
  }, []);
  
  // Auto-validate username when typing
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
  
  // Auto-validate coupon when typing
  useEffect(() => {
    if (couponCode.trim().length > 2) {
      setIsValidatingCoupon(true);
      setCouponError('');
      
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
  
  // Update requiredGamepassPrice ketika robuxAmount berubah
  useEffect(() => {
    setRequiredGamepassPrice(calculateGamepassPrice(robuxAmount));
    setGamepassVerified(false);
    setGamepassStep('create');
  }, [robuxAmount]);
  
  // Fungsi helper untuk menampilkan notifikasi
  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setModalData({ title, message, type });
    setShowNotificationModal(true);
  };
  
  // Fungsi helper untuk menampilkan konfirmasi
  const showConfirmation = (title: string, message: string, onConfirm: () => void, onCancel?: () => void, gamepassDetails?: any, robuxAmount?: number, totalPrice?: number) => {
    setModalData({ title, message, type: 'info', onConfirm, onCancel, gamepassDetails, robuxAmount, totalPrice });
    setShowConfirmModal(true);
  };
  
  // Fungsi untuk handle reCAPTCHA
  const handleRecaptchaVerify = (token: string) => {
    setRecaptchaToken(token);
    setRecaptchaError('');
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken('');
    setRecaptchaError('reCAPTCHA expired. Please verify again.');
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken('');
    setRecaptchaError('reCAPTCHA error. Please try again.');
  };
  
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/robux-stock');
      const stockData = await response.json();
      setRobuxStock(stockData); // Simpan data stock
      if (stockData.length > 0) {
        // Ambil harga per 100 Robux dari data admin
        const pricePerHundred = stockData[0].price;
        setRobuxPrice(pricePerHundred);
      }
    } catch (_error) {
      console.error('Failed to fetch robux price:', _error);
      // Fallback ke harga default jika gagal
      setRobuxPrice(0);
    }
  };
  
  const fetchPaymentChannels = async () => {
    try {
      setLoadingChannels(true);
      const response = await fetch('/api/tripay/channels');
      const data = await response.json();
      
      if (data.success) {
        setPaymentChannels(data.channels);
        // Set default payment method ke channel pertama yang aktif
        if (data.channels.length > 0) {
          setPaymentMethod(data.channels[0].code);
        }
      } else {
        console.error('Failed to fetch payment channels:', data.error);
        // Fallback ke channels default jika API gagal
        setPaymentChannels(getDefaultChannels());
      }
    } catch (error) {
      console.error('Error fetching payment channels:', error);
      // Fallback ke channels default
      setPaymentChannels(getDefaultChannels());
    } finally {
      setLoadingChannels(false);
    }
  };
  
  const getDefaultChannels = () => [
    { code: 'QRIS', name: 'QRIS (Semua E-Wallet)', active: true },
    { code: 'BRIVA', name: 'BRI Virtual Account', active: true },
    { code: 'BNIVA', name: 'BNI Virtual Account', active: true },
    { code: 'BSIVA', name: 'BSI Virtual Account', active: true },
    { code: 'MANDIRIVA', name: 'Mandiri Virtual Account', active: true },
    { code: 'PERMATAVA', name: 'Permata Virtual Account', active: true },
    { code: 'ALFAMART', name: 'Alfamart', active: true },
    { code: 'INDOMARET', name: 'Indomaret', active: true }
  ];
  
  // Tambahkan pengecekan allowOrders
  const canOrder = robuxStock.some(stock => stock.isActive && stock.allowOrders);
  
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
    } catch (_error) {
      console.error('Error validating username:', _error);
      setRobloxUser(null);
    } finally {
      setIsValidating(false);
      setHasSearched(true);
    }
  };
  
  // Fungsi validasi kupon baru
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
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
    } catch (_error) {
      console.error('Error validating coupon:', _error);
      setCouponData(null);
      setCouponError('Gagal memvalidasi kupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };
  
  const calculatePrice = () => {
    const basePrice = Math.round((robuxAmount / 100) * robuxPrice);
    
    if (!couponData) return basePrice;
    
    let discount = 0;
    if (couponData.type === 'percentage') {
      discount = Math.round(basePrice * (couponData.discount / 100));
    } else {
      discount = couponData.discount;
    }
    
    return Math.max(0, basePrice - discount);
  };
  
  const getDiscountAmount = () => {
    if (!couponData) return 0;
    
    const basePrice = Math.round((robuxAmount / 100) * robuxPrice);
    
    if (couponData.type === 'percentage') {
      return Math.round(basePrice * (couponData.discount / 100));
    } else {
      return couponData.discount;
    }
  };
  
  // Hitung harga gamepass yang diperlukan
  const calculateGamepassPrice = (robuxAmount: number) => {
    return Math.round(robuxAmount * 1.43); // 43% markup
  };
  
  // Fungsi check gamepass
  const _checkGamepass = async () => {
    if (!robloxUser) {
      showNotification('Error', 'Silakan validasi username terlebih dahulu!', 'error');
      return;
    }

    setIsCheckingGamepass(true);
    try {
      const response = await fetch('/api/roblox/check-gamepass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: robloxUser.id,
          requiredPrice: requiredGamepassPrice
        }),
      });

      const data = await response.json();

      if (data.success && data.hasValidGamepass) {
        setGamepassVerified(true);
        setGamepassStep('completed');
        showNotification('Berhasil', 'Gamepass terverifikasi! Silakan lanjutkan untuk membuat transaksi.', 'success');
      } else {
        showNotification('Error', 'Gamepass belum ditemukan atau harga tidak sesuai. Pastikan Anda sudah membuat gamepass dengan harga yang benar.', 'error');
        setGamepassVerified(false);
      }
    } catch (_error) {
      console.error('Error checking gamepass:', _error);
      showNotification('Error', 'Gagal memverifikasi gamepass!', 'error');
      setGamepassVerified(false);
    } finally {
      setIsCheckingGamepass(false);
    }
  };
  
  // Fungsi baru untuk membuat transaksi dengan gamepass ID yang sudah diverifikasi
  const createTransactionWithGamepass = async (gamepassId: string) => {
    if (!robloxUser) {
      showNotification('Error', 'Data pengguna Roblox tidak ditemukan!', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const transactionData = {
        robloxUsername: robloxUser.username,
        robloxId: robloxUser.id,
        robuxAmount,
        method: 'gamepass',
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim() || null,
        couponCode: couponCode.trim() || null,
        discount: getDiscountAmount(),
        finalPrice: calculatePrice(),
        gamepassPrice: requiredGamepassPrice,
        gamepassVerified: true, // LANGSUNG SET TRUE
        gamepassId: gamepassId.toString(), // LANGSUNG GUNAKAN PARAMETER
        recaptchaToken // Tambahkan token reCAPTCHA
      };
      
      // console.log('=== Sending transaction data with gamepass ===', transactionData);
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Transaction API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        showNotification('Error', `Gagal membuat transaksi: ${errorData.error || 'Unknown error'}`, 'error');
        setIsLoading(false);
        return;
      }
      
      const transaction = await response.json();
      
      if (true) {
        // Lanjutkan dengan pembayaran Tripay seperti biasa
        const paymentData = {
          transactionId: transaction.id,
          amount: calculatePrice(),
          customerName: robloxUser.username,
          customerEmail: email.trim() || `${robloxUser.username.toLowerCase()}@zeeboost.com`, // Email dummy jika kosong
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
          window.location.href = paymentResult.paymentUrl;
          showNotification('Info', `Transaksi dibuat! ID: ${transaction.id}. Silakan selesaikan pembayaran.`, 'info');
        } else {
          showNotification('Error', 'Gagal membuat pembayaran!', 'error');
          return;
        }
        
        // Reset form
        setUsername('');
        setRobloxUser(null);
        setRobuxAmount(100);
        setWhatsappNumber('');
        setEmail('');
        setCouponCode('');
        setCouponData(null);
        setGamepassVerified(false);
        setGamepassStep('create');
        setShowGamepassModal(false);
        
        // Reset reCAPTCHA
        if (recaptchaRef.current?.reset) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken('');
        
        if (window.gamepassDetails) {
          delete window.gamepassDetails;
        }
      } else {
        // Reset reCAPTCHA jika gagal
        if (recaptchaRef.current?.reset) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken('');
        showNotification('Error', 'Gagal membuat transaksi!', 'error');
      }
    } catch (_error) {
      console.error('Error creating transaction:', _error);
      // Reset reCAPTCHA jika error
      if (recaptchaRef.current?.reset) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken('');
      showNotification('Error', 'Terjadi kesalahan!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi terpisah untuk membuat transaksi
  const _createTransaction = async () => {
    if (!robloxUser) {
      showNotification('Error', 'Data pengguna Roblox tidak ditemukan!', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      // Buat transaksi terlebih dahulu
      const transactionData = {
        robloxUsername: robloxUser.username,
        robloxId: robloxUser.id,
        robuxAmount,
        method: 'gamepass',
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim() || null,
        couponCode: couponCode.trim() || null,
        discount: getDiscountAmount(),
        finalPrice: calculatePrice(),
        gamepassPrice: requiredGamepassPrice,
        gamepassVerified: gamepassVerified,
        // PERBAIKAN: Pastikan gamepassId dikirim
        ...(gamepassVerified && window.gamepassDetails && {
          gamepassId: window.gamepassDetails.id.toString()
        }),
        recaptchaToken // Tambahkan token reCAPTCHA
      };
      
      // console.log('=== Sending transaction data ===', transactionData);
      // console.log('=== GAMEPASS DEBUG ===');
      // console.log('gamepassVerified:', gamepassVerified);
      // console.log('window.gamepassDetails:', window.gamepassDetails);
      // console.log('gamepassId being sent:', window.gamepassDetails?.id);
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      
      const transaction = await response.json();
      
      if (response.ok) {
        // Setelah transaksi berhasil dibuat, langsung buat pembayaran Tripay
        const paymentData = {
          transactionId: transaction.id,
          amount: calculatePrice(),
          customerName: robloxUser.username,
          customerEmail: email.trim() || `${robloxUser.username.toLowerCase()}@zeeboost.com`, // Email dummy jika kosong
          customerPhone: whatsappNumber.trim(),
          paymentMethod: paymentMethod
        };
        
        // console.log('=== Sending to Tripay API ===');
        // console.log('Payment data:', paymentData);
        
        const paymentResponse = await fetch('/api/payment/tripay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        });
        
        const paymentResult = await paymentResponse.json();
        // console.log('Payment response:', paymentResult);
        
        if (paymentResult.success) {
          // Redirect ke halaman pembayaran Tripay
          window.location.href = paymentResult.paymentUrl;
          showNotification('Info', `Transaksi dibuat! ID: ${transaction.id}. Silakan selesaikan pembayaran.`, 'info');
        } else {
          showNotification('Error', 'Gagal membuat pembayaran!', 'error');
          return;
        }
        
        // Reset form
        setUsername('');
        setRobloxUser(null);
        setRobuxAmount(100);
        setWhatsappNumber('');
        setEmail('');
        setCouponCode('');
        setCouponData(null);
        setGamepassVerified(false);
        setGamepassStep('create');
        setShowGamepassModal(false);
        
        // Reset reCAPTCHA
        if (recaptchaRef.current?.reset) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken('');
        
        // Bersihkan gamepass details
        if (window.gamepassDetails) {
          delete window.gamepassDetails;
        }
      } else {
        // Reset reCAPTCHA jika gagal
        if (recaptchaRef.current?.reset) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken('');
        showNotification('Error', 'Gagal membuat transaksi!', 'error');
      }
    } catch (_error) {
      console.error('Error creating transaction:', _error);
      // Reset reCAPTCHA jika error
      if (recaptchaRef.current?.reset) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken('');
      showNotification('Error', 'Terjadi kesalahan!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi verifikasi gamepass di modal yang diperbarui
  const verifyGamepassInModal = async () => {
  if (!robloxUser) {
    showNotification('Error', 'Data pengguna Roblox tidak ditemukan!', 'error');
    return;
  }
  
  setIsCheckingGamepass(true);
  try {
    const response = await fetch('/api/roblox/check-gamepass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: robloxUser.id,
        requiredPrice: requiredGamepassPrice
      }),
    });
    
    const data = await response.json();
    
    if (data.success && data.hasValidGamepass) {
      setGamepassVerified(true);
      setGamepassStep('completed');
      
      // Simpan data gamepass untuk digunakan saat membuat transaksi
      window.gamepassDetails = data.gamepassDetails;
      
      // console.log('=== GAMEPASS VERIFIED ===');
      // console.log('GamepassId:', data.gamepassDetails.id);
      // console.log('GamepassVerified set to:', true);
      
      // Tampilkan konfirmasi dengan detail gamepass
      const gamepassDetails = data.gamepassDetails;
      showConfirmation(
        'Gamepass Terverifikasi!',
        'Gamepass Anda telah berhasil diverifikasi. Lanjutkan untuk membuat pesanan?',
        async () => {
          setShowGamepassModal(false);
          // PERBAIKAN: Panggil createTransactionWithGamepass dengan gamepass ID
          await createTransactionWithGamepass(gamepassDetails.id.toString());
        },
        () => {
          setGamepassVerified(false);
          setGamepassStep('create');
          delete window.gamepassDetails;
        },
        gamepassDetails,
        data.robuxAmount,
        calculatePrice()
      );
    } else {
      showNotification(
        'Gamepass Tidak Ditemukan',
        data.message || 'Gamepass belum ditemukan atau harga tidak sesuai. Pastikan Anda sudah membuat gamepass dengan harga yang benar.',
        'error'
      );
    }
  } catch (_error) {
    console.error('Error checking gamepass:', _error);
    showNotification('Error', 'Gagal memverifikasi gamepass!', 'error');
  } finally {
    setIsCheckingGamepass(false);
  }
};
  // Modifikasi handleTopup function
const handleTopup = async () => {
  if (!robloxUser) {
    showNotification('Error', 'Silakan validasi username terlebih dahulu!', 'error');
    return;
  }
  
  if (!whatsappNumber.trim()) {
    showNotification('Error', 'Silakan masukkan nomor WhatsApp!', 'error');
    return;
  }
  
  // Validasi reCAPTCHA
  if (!recaptchaToken) {
    setRecaptchaError('Please complete the reCAPTCHA verification.');
    return;
  }
  
  // Tampilkan modal informasi delivery terlebih dahulu
  setShowDeliveryModal(true);
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
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Topup via Gamepass</h3>
        <p className="text-sm sm:text-base text-gray-600">Isi form di bawah untuk memulai proses topup</p>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Username Input - Responsive */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Username Roblox
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Roblox"
              className="w-full px-3 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
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
                <Image 
                  src={robloxUser.avatarUrl || '/default-avatar.png'}
                  alt={robloxUser.username}
                  width={48}
                  height={48}
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
        
        {/* Robux Slider - Responsive */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Jumlah Robux
          </label>
          <RobuxSlider 
            value={robuxAmount} 
            onChange={setRobuxAmount}
            min={100}
            max={10000}
            step={100}
          />
        </div>
        
        {/* WhatsApp Input - Responsive */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nomor WhatsApp
          </label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="Contoh: 08123456789"
            className="w-full px-3 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        {/* Email Input - Responsive */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email (Opsional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Contoh: user@example.com"
            className="w-full px-3 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
          />
        </div>
        
        {/* Coupon Input - Responsive */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Kode Kupon (Opsional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode kupon"
              className="w-full px-3 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            />
            {isValidatingCoupon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>
          
          {/* Loading indicator untuk coupon */}
          {isValidatingCoupon && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-blue-700 text-xs">Sedang memvalidasi kupon...</span>
              </div>
            </div>
          )}
          
          {/* Coupon Success */}
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
          
          {/* Coupon Error */}
          {couponError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <i className="fas fa-exclamation-circle text-red-500"></i>
                <span className="text-red-700 text-sm">{couponError}</span>
              </div>
            </div>
          )}
        </div>
        {/* Tambahkan dropdown metode pembayaran sebelum tombol */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metode Pembayaran
          </label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loadingChannels}
          >
            {loadingChannels ? (
              <option>Loading payment methods...</option>
            ) : (
              paymentChannels.map((channel) => (
                <option key={channel.code} value={channel.code}>
                  {channel.name}
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* reCAPTCHA */}
        <div className="mb-6">
          <ReCaptcha
            siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onVerify={handleRecaptchaVerify}
            onExpired={handleRecaptchaExpired}
            onError={handleRecaptchaError}
            instanceId="gamepass"
          />
          {recaptchaError && (
            <p className="text-red-500 text-sm mt-2 text-center">{recaptchaError}</p>
          )}
        </div>
        
        {/* Price Summary - Responsive */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Harga Dasar ({robuxAmount} Robux)</span>
            <span className="font-medium">Rp {Math.round((robuxAmount / 100) * robuxPrice).toLocaleString('id-ID')}</span>
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
              <span className="font-bold text-lg text-primary">Rp {calculatePrice().toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
        
        {/* Submit Button - Responsive */}
        <button
          onClick={handleTopup}
          disabled={!robloxUser || isLoading || !whatsappNumber.trim() || !canOrder || !recaptchaToken}
          className="w-full bg-primary-dark hover:bg-primary-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Memproses...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 ">
              <i className="fas fa-shopping-cart"></i>
              <span >Buat Pesanan</span>
            </div>
          )}
        </button>
      </div>
      
        {/* Modal Gamepass */}
      {showGamepassModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Verifikasi Gamepass</h3>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Untuk melanjutkan, silakan buat gamepass di Roblox dengan harga:
                </p>
                <p className="text-xl font-bold text-green-600">
                  {requiredGamepassPrice.toLocaleString('id-ID')} Robux
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">
                  Langkah-langkah:
                </p>
                <ol className="text-sm text-left text-gray-600 space-y-1">
                  <li>1. Buka Roblox Creator Hub</li>
                  <li>2. Buat gamepass baru</li>
                  <li>3. Set harga: {requiredGamepassPrice.toLocaleString('id-ID')} Robux</li>
                  <li>4. Klik "Verifikasi" di bawah</li>
                </ol>
                
                {/* Tambahkan link artikel cara membuat gamepass */}
                <p className="text-sm text-center mt-3">
                  <a 
                    href="/gamepass-guide" 
                    target="_blank" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Lihat tutorial zeeboost untuk cara membuat gamepass!
                  </a>
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowGamepassModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={verifyGamepassInModal}
                  disabled={isCheckingGamepass}
                  className="flex-1 px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-900 disabled:opacity-50 transition-colors"
                >
                  {isCheckingGamepass ? 'Memverifikasi...' : 'Verifikasi Gamepass'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">{modalData.title}</h3>
              
              {modalData.gamepassDetails && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg text-left">
                  <h4 className="font-medium text-green-800 mb-2">Detail Gamepass:</h4>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>• Nama: {modalData.gamepassDetails.name}</p>
                    <p>• ID: {modalData.gamepassDetails.id}</p>
                    <p>• Harga: {modalData.gamepassDetails.price} Robux</p>
                    <p>• Creator: {modalData.gamepassDetails.creator}</p>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Transaksi:</h4>
                    <div className="space-y-1 text-sm text-green-700">
                      <p>• Robux yang akan diterima: {modalData.robuxAmount}</p>
                      <p>• Total pembayaran: Rp {modalData.totalPrice?.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-600 mb-6">{modalData.message}</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    modalData.onCancel?.();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    modalData.onConfirm?.();
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Delivery Information */}
{showDeliveryModal && (
  <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Penting: Estimasi Pengiriman Robux</h3>
        
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            Harap diperhatikan bahwa pengiriman Robux membutuhkan waktu <strong>minimal 5 hari</strong> setelah pembayaran berhasil.
          </p>
          <p className="text-sm font-medium text-yellow-700">
            Dengan melanjutkan, Anda menyetujui estimasi waktu pengiriman ini.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeliveryModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              setShowDeliveryModal(false);
              setShowGamepassModal(true);
            }}
            className="flex-1 px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-900 transition-colors"
          >
            Saya Setuju
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      
      {/* Modal Notifikasi */}
      {showNotificationModal && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                {modalData.type === 'success' && (
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-green-600 text-xl"></i>
                  </div>
                )}
                {modalData.type === 'error' && (
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-times text-red-600 text-xl"></i>
                  </div>
                )}
                {modalData.type === 'info' && (
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-info text-blue-600 text-xl"></i>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{modalData.title}</h3>
              <p className="text-gray-600 mb-6">{modalData.message}</p>
              
              <button
                onClick={() => setShowNotificationModal(false)}
                className={`w-full px-4 py-2 rounded-lg text-white transition-colors ${
                  modalData.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                  modalData.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
