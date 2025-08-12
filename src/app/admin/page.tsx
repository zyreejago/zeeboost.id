'use client';

import { useState } from 'react';
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
            fetchData={fetchData}
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
            fetchData={fetchData}
          />
        );
      case 'news':
        return (
          <NewsManagement 
            news={news}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            fetchData={fetchData}
          />
        );
      case 'discounts':
        return (
          <DiscountManagement 
            discounts={discounts}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            fetchData={fetchData}
          />
        );
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

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-100">
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
      </div>
    </AdminAuth>
  );
}