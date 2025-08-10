export interface Transaction {
  id: number;
  user: {
    email?: string;
    robloxUsername: string;
    whatsappNumber?: string;
  };
  robuxAmount: number;
  totalPrice: number;
  method: string;
  status: string;
  createdAt: string;
  paymentProof?: string;
  gamepassUrl?: string;
  couponCode?: string;
  discount?: number;
  finalPrice?: number;
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