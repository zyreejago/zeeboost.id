'use client';

import { useState, useEffect } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import AdminAuth from '@/components/admin/AdminAuth';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Dashboard } from '@/components/admin/Dashboard';
import StockManagement from '@/components/admin/StockManagement';
import TransactionList from '@/components/admin/TransactionList';
import NewsManagement from '@/components/admin/NewsManagement';
import BannerManagement from '@/components/admin/BannerManagement';
import DiscountManagement from '@/components/admin/DiscountManagement';
import ReportManagement from '@/components/admin/ReportManagement';
import RobuxThemesManagement from '@/components/admin/RobuxThemesManagement';
import ReviewManagement from '@/components/admin/ReviewManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default false for mobile-first
  
  const {
    transactions,
    news,
    banners,
    robuxStock,
    discounts,
    isLoading,
    setIsLoading,
    fetchData,
  } = useAdminData();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions}
            news={news}
            banners={banners}
            robuxStock={robuxStock}
            discounts={discounts}
          />
        );
      case 'transactions':
        return (
          <TransactionList 
            transactions={transactions}
            onRefresh={fetchData}
          />
        );
      case 'stock':
        return (
          <StockManagement 
            robuxStock={robuxStock}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onRefresh={fetchData}
          />
        );
      case 'robux-themes':
        return <RobuxThemesManagement />;
      case 'banners':
        return (
          <BannerManagement 
            banners={banners}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onRefresh={fetchData}
          />
        );
      case 'news':
        return (
          <NewsManagement 
            news={news}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onRefresh={fetchData}
          />
        );
      case 'discounts':
        return (
          <DiscountManagement 
            discounts={discounts}
            onRefresh={fetchData}
          />
        );
      case 'reviews':
        return <ReviewManagement />;
      case 'reports':
        return <ReportManagement transactions={transactions} />;
      default:
        return (
          <Dashboard 
            transactions={transactions}
            news={news}
            banners={banners}
            robuxStock={robuxStock}
            discounts={discounts}
          />
        );
    }
  };

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-100">
        <div className="min-h-screen bg-gray-50 flex relative">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          
          <div className="flex-1 flex flex-col min-w-0">
            <Header 
              activeTab={activeTab} 
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
            
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}