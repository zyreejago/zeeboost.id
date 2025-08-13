import { useState, useEffect } from 'react';
import { Transaction, News, Banner, RobuxStock, Discount } from '@/types/admin';

export const useAdminData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [robuxStock, setRobuxStock] = useState<RobuxStock[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [transRes, newsRes, bannersRes, stockRes, discountsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/admin/news'),
        fetch('/api/banners'),
        fetch('/api/admin/robux-stock'),
        fetch('/api/admin/discounts'),
      ]);

      setTransactions(await transRes.json());
      setNews(await newsRes.json());
      setBanners(await bannersRes.json());
      setRobuxStock(await stockRes.json());
      setDiscounts(await discountsRes.json());
    } catch (_error) {
      console._error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    transactions,
    news,
    banners,
    robuxStock,
    discounts,
    isLoading,
    setIsLoading,
    fetchData,
    setTransactions,
    setNews,
    setBanners,
    setRobuxStock,
    setDiscounts,
  };
};