'use client';

import { useState } from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Dashboard } from '@/components/admin/Dashboard';
import StockManagement from '@/components/admin/StockManagement';
import TransactionList from '@/components/admin/TransactionList';
import NewsManagement from '@/components/admin/NewsManagement';
import BannerManagement from '@/components/admin/BannerManagement';
import DiscountManagement from '@/components/admin/DiscountManagement';
import ReportManagement from '@/components/admin/ReportManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
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
            robuxStock={robuxStock}
            onRefresh={fetchData}
          />
        );
      case 'stock':
        return (
          <StockManagement
            robuxStock={robuxStock}
            onRefresh={fetchData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 'transactions':
        return <TransactionList transactions={transactions} onRefresh={fetchData} />;
      case 'reports':
        return <ReportManagement transactions={transactions} />;
      case 'news':
        return (
          <NewsManagement
            news={news}
            onRefresh={fetchData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 'banners':
        return <BannerManagement banners={banners} onRefresh={fetchData} />;
      case 'discounts':
        return <DiscountManagement discounts={discounts} onRefresh={fetchData} />;
      default:
        return (
          <Dashboard 
            transactions={transactions} 
            news={news} 
            robuxStock={robuxStock}
            onRefresh={fetchData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col">
        <Header activeTab={activeTab} />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}