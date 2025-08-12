export interface Transaction {
  id: number;
  userId: string;
  robuxAmount: number;
  totalPrice: number;
  finalPrice?: number;
  robuxStockId?: number;
  robuxStock?: {
    id: number;
    amount: number;
    price: number;
    isActive: boolean;
    allowOrders: boolean;
  };
  method: string;
  status: string;
  paymentProof?: string;
  paymentReference?: string;
  paymentMethod?: string;
  couponCode?: string;
  discount?: number;
  gamepassUrl?: string;
  gamepassId?: string;
  // Tambahkan field untuk via login
  robloxPassword?: string;
  isAliveVerification?: boolean;
  backupCodes?: string;
  robuxOptionType?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    robloxUsername: string;
    email?: string;
    whatsappNumber?: string;
  };
}

export interface News {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
}

export interface RobuxStock {
  id: number;
  amount: number;
  price: number;
  isActive: boolean;
  allowOrders: boolean; // field baru untuk mengatur order
}

export interface Discount {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses: number;
  currentUses: number;
  minPurchase: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
}