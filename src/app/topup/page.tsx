'use client';

import { useState, useEffect } from 'react';
import RobuxSlider from '@/components/RobuxSlider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SimpleFooter from '@/components/SimpleFooter';
import ChatCS from '@/components/ChatCS';

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

export default function TopupPage() {
  const [activeMethod, setActiveMethod] = useState<'gamepass' | 'login'>('gamepass');
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
  
  // Tambahkan state untuk robux stock
  const [robuxStock, setRobuxStock] = useState<any[]>([]);
  
  const [gamepassStep, setGamepassStep] = useState<'create' | 'verify' | 'completed'>('create');
  const [requiredGamepassPrice, setRequiredGamepassPrice] = useState(0);
  const [isCheckingGamepass, setIsCheckingGamepass] = useState(false);
  const [gamepassVerified, setGamepassVerified] = useState(false);
  
  // Tambahkan state untuk modal
  const [showGamepassModal, setShowGamepassModal] = useState(false);
  
  // Tambahkan state baru untuk modal konfirmasi dan notifikasi
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
    gamepassDetails?: any;
    robuxAmount?: number;
    totalPrice?: number;
  }>({} as any);
  
  useEffect(() => {
    fetchSettings();
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
    } catch (error) {
      console.error('Failed to fetch robux price:', error);
      // Fallback ke harga default jika gagal
      setRobuxPrice(0);
    }
  };
  
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
    } catch (error) {
      console.error('Error validating username:', error);
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
    } catch (error) {
      console.error('Error validating coupon:', error);
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
  const checkGamepass = async () => {
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
    } catch (error) {
      console.error('Error checking gamepass:', error);
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
        method: activeMethod,
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim(),
        couponCode: couponCode.trim() || null,
        discount: getDiscountAmount(),
        finalPrice: calculatePrice(),
        gamepassPrice: requiredGamepassPrice,
        gamepassVerified: true, // LANGSUNG SET TRUE
        gamepassId: gamepassId.toString() // LANGSUNG GUNAKAN PARAMETER
      };
      
      console.log('=== Sending transaction data with gamepass ===', transactionData);
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });
      
      const transaction = await response.json();
      
      if (response.ok) {
        // Lanjutkan dengan pembayaran Tripay seperti biasa
        const paymentData = {
          transactionId: transaction.id,
          amount: calculatePrice(),
          customerName: robloxUser.username,
          customerEmail: email.trim(),
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
          showNotification('Info', `Transaksi dibuat! ID: ${transaction.id}. Silakan selesaikan pembayaran di tab yang baru dibuka.`, 'info');
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
        
        if (window.gamepassDetails) {
          delete window.gamepassDetails;
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

  // Fungsi terpisah untuk membuat transaksi
  // Di fungsi createTransaction, tambahkan gamepass data
  // Update fungsi createTransaction untuk mengirim gamepass ID
  const createTransaction = async () => {
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
        method: activeMethod,
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim(),
        couponCode: couponCode.trim() || null,
        discount: getDiscountAmount(),
        finalPrice: calculatePrice(),
        gamepassPrice: requiredGamepassPrice,
        gamepassVerified: activeMethod === 'gamepass' ? gamepassVerified : false,
        // PERBAIKAN: Pastikan gamepassId dikirim
        ...(activeMethod === 'gamepass' && gamepassVerified && window.gamepassDetails && {
          gamepassId: window.gamepassDetails.id.toString()  // <-- CONVERT TO STRING
        })
      };
      
      console.log('=== Sending transaction data ===', transactionData);
      console.log('=== GAMEPASS DEBUG ===');
      console.log('activeMethod:', activeMethod);
      console.log('gamepassVerified:', gamepassVerified);
      console.log('window.gamepassDetails:', window.gamepassDetails);
      console.log('gamepassId being sent:', window.gamepassDetails?.id);
      
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
          customerEmail: email.trim(),
          customerPhone: whatsappNumber.trim(),
          paymentMethod: paymentMethod
        };
        
        console.log('=== Sending to Tripay API ===');
        console.log('Payment data:', paymentData);
        
        const paymentResponse = await fetch('/api/payment/tripay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        });
        
        const paymentResult = await paymentResponse.json();
        console.log('Payment response:', paymentResult);
        
        if (paymentResult.success) {
          // Redirect ke halaman pembayaran Tripay
          window.open(paymentResult.paymentUrl, '_blank');
          showNotification('Info', `Transaksi dibuat! ID: ${transaction.id}. Silakan selesaikan pembayaran di tab yang baru dibuka.`, 'info');
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
        
        // Bersihkan gamepass details
        if (window.gamepassDetails) {
          delete window.gamepassDetails;
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
  
  // Fungsi untuk membuat transaksi dengan gamepass ID
  // const createTransactionWithGamepass = async (gamepassId: string) => {
  //   if (!robloxUser) {
  //     showNotification('Error', 'Data pengguna Roblox tidak ditemukan!', 'error');
  //     return;
  //   }
    
  //   setIsLoading(true);
  //   try {
  //     // Buat transaksi dengan gamepass ID yang sudah diverifikasi
  //     const transactionData = {
  //       robloxUsername: robloxUser.username,
  //       robloxId: robloxUser.id,
  //       robuxAmount,
  //       method: activeMethod,
  //       whatsappNumber: whatsappNumber.trim(),
  //       email: email.trim(),
  //       couponCode: couponCode.trim() || null,
  //       discount: getDiscountAmount(),
  //       finalPrice: calculatePrice(),
  //       gamepassPrice: requiredGamepassPrice,
  //       gamepassVerified: true, // Langsung set true karena sudah diverifikasi
  //       gamepassId: gamepassId // Gunakan gamepass ID yang sudah diverifikasi
  //     };
      
  //     console.log('=== Sending transaction data with verified gamepass ===', transactionData);
      
  //     const response = await fetch('/api/transactions', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(transactionData),
  //     });
      
  //     const transaction = await response.json();
      
  //     if (response.ok) {
  //       // Setelah transaksi berhasil dibuat, langsung buat pembayaran Tripay
  //       const paymentData = {
  //         transactionId: transaction.id,
  //         amount: calculatePrice(),
  //         customerName: robloxUser.username,
  //         customerEmail: email.trim(),
  //         customerPhone: whatsappNumber.trim(),
  //         paymentMethod: paymentMethod
  //       };
        
  //       console.log('=== Sending to Tripay API ===');
  //       console.log('Payment data:', paymentData);
        
  //       const paymentResponse = await fetch('/api/payment/tripay', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(paymentData)
  //       });
        
  //       const paymentResult = await paymentResponse.json();
  //       console.log('Payment response:', paymentResult);
        
  //       if (paymentResult.success) {
  //         // Redirect ke halaman pembayaran Tripay
  //         window.open(paymentResult.paymentUrl, '_blank');
  //         showNotification('Info', `Transaksi dibuat! ID: ${transaction.id}. Silakan selesaikan pembayaran di tab yang baru dibuka.`, 'info');
  //       } else {
  //         showNotification('Error', 'Gagal membuat pembayaran!', 'error');
  //         return;
  //       }
        
  //       // Reset form
  //       setUsername('');
  //       setRobloxUser(null);
  //       setRobuxAmount(100);
  //       setWhatsappNumber('');
  //       setEmail('');
  //       setCouponCode('');
  //       setCouponData(null);
  //       setGamepassVerified(false);
  //       setGamepassStep('create');
  //       setShowGamepassModal(false);
        
  //       // Bersihkan gamepass details
  //       if (window.gamepassDetails) {
  //         delete window.gamepassDetails;
  //       }
  //     } else {
  //       showNotification('Error', 'Gagal membuat transaksi!', 'error');
  //     }
  //   } catch (error) {
  //     console.error('Error creating transaction:', error);
  //     showNotification('Error', 'Terjadi kesalahan!', 'error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
      
      console.log('=== GAMEPASS VERIFIED ===');
      console.log('GamepassId:', data.gamepassDetails.id);
      console.log('GamepassVerified set to:', true);
      
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
  } catch (error) {
    console.error('Error checking gamepass:', error);
    showNotification('Error', 'Gagal memverifikasi gamepass!', 'error');
  } finally {
    setIsCheckingGamepass(false);
  }
};
  const handleTopup = async () => {
    if (!robloxUser) {
      showNotification('Error', 'Silakan validasi username terlebih dahulu!', 'error');
      return;
    }
    
    if (!whatsappNumber.trim()) {
      showNotification('Error', 'Silakan masukkan nomor WhatsApp!', 'error');
      return;
    }
    
    if (!email.trim()) {
      showNotification('Error', 'Silakan masukkan email!', 'error');
      return;
    }
    
    // Jika metode gamepass, tampilkan modal verifikasi
    if (activeMethod === 'gamepass') {
      setShowGamepassModal(true);
      return;
    }
    
    // Jika bukan gamepass, langsung buat transaksi
    await createTransaction();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section dengan Gradient dan Pattern - Responsive */}
        <div className="relative bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-white rounded-full blur-2xl sm:blur-3xl"></div>
            <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-12 sm:w-16 lg:w-24 h-12 sm:h-16 lg:h-24 bg-white rounded-full blur-xl sm:blur-2xl"></div>
            <div className="absolute bottom-5 sm:bottom-10 left-1/4 sm:left-1/3 w-14 sm:w-20 lg:w-28 h-14 sm:h-20 lg:h-28 bg-white rounded-full blur-2xl sm:blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 mb-3 sm:mb-4">
              <i className="fas fa-coins text-yellow-300 mr-1.5 text-xs sm:text-sm"></i>
              <span className="text-xs font-medium">Platform Topup #1 Indonesia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent leading-tight">
              Topup Robux Sekarang
            </h1>
            <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-4 sm:mb-6 max-w-xl mx-auto leading-relaxed px-4">
              Pilih jumlah Robux dan metode topup yang Anda inginkan.
              Proses cepat, aman, dan terpercaya!
            </p>
            
            {/* Stats - Ukuran lebih kecil untuk desktop */}
            <div className="flex justify-center items-center space-x-3 sm:space-x-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[60px]">
                <div className="text-sm sm:text-base font-bold">10K+</div>
                <div className="text-xs opacity-80">Transaksi</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[60px]">
                <div className="text-sm sm:text-base font-bold">24/7</div>
                <div className="text-xs opacity-80">Support</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[60px]">
                <div className="text-sm sm:text-base font-bold">100%</div>
                <div className="text-xs opacity-80">Aman</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto py-8 sm:py-12 lg:py-16 px-4">
          {/* Method Selection dengan Card Design - Responsive */}
          <div className="mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">Pilih Metode Topup</h2>
              <p className="text-sm sm:text-base text-gray-600">Pilih metode yang paling sesuai untuk Anda</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <button
                onClick={() => setActiveMethod('gamepass')}
                className={`group p-4 sm:p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 text-left shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  activeMethod === 'gamepass'
                    ? 'border-primary bg-gradient-to-br from-primary-50 to-primary-100 shadow-primary/20'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mt-1 transition-all ${
                    activeMethod === 'gamepass' 
                      ? 'bg-primary border-primary shadow-lg' 
                      : 'border-gray-300 group-hover:border-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-gamepad text-primary text-lg sm:text-xl"></i>
                      <h3 className="font-bold text-lg sm:text-xl text-gray-800">Via Gamepass</h3>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Recommended</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-3">Topup melalui pembelian gamepass Roblox</p>
                    <div className="flex items-center space-x-4 text-xs sm:text-sm">
                      <div className="flex items-center text-green-600">
                        <i className="fas fa-shield-alt mr-1"></i>
                        <span>100% Aman</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveMethod('login')}
                className="group p-4 sm:p-6 lg:p-8 rounded-2xl border-2 border-gray-200 bg-white text-left relative overflow-hidden shadow-lg transition-all duration-300"
                disabled
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <i className="fas fa-sign-in-alt text-gray-400 text-lg sm:text-xl"></i>
                      <h3 className="font-bold text-lg sm:text-xl text-gray-800">Via Login</h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-3">Topup melalui login akun Roblox</p>
                    <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center">
                        <i className="fas fa-clock mr-1"></i>
                        <span>Segera Hadir</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Coming Soon Overlay dengan Glassmorphism - Responsive */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 sm:px-6 py-2 sm:py-3 shadow-2xl">
                    <span className="text-gray-800 font-semibold flex items-center text-sm sm:text-base">
                      <i className="fas fa-rocket mr-2"></i>
                      Via Login Coming Soon
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          {activeMethod === 'gamepass' && (
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
                    Email
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
                  disabled={!robloxUser || isLoading || !whatsappNumber.trim() || !email.trim() || !canOrder}
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
            </div>
          )}
        </div>
        
        {/* Modal Verifikasi Gamepass */}
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
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
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
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <SimpleFooter />
      <ChatCS />
    </>
  );
}