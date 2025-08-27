import React from 'react';

interface HeaderProps {
  activeTab: string;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Header({ activeTab, sidebarOpen, setSidebarOpen }: HeaderProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'transactions', name: 'Transaksi' },
    { id: 'reports', name: 'Laporan' },
    { id: 'stock', name: 'Stock Robux' },
    { id: 'robux-themes', name: 'Robux Vilog' },
    { id: 'banners', name: 'Banner' },
    { id: 'news', name: 'News' },
    { id: 'discounts', name: 'Discount' },
    { id: 'reviews', name: 'Review' },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-30">
      <div className="px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden mr-3"
            >
              <i className="fas fa-bars text-gray-600"></i>
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 hidden sm:flex items-center">
              <i className="fas fa-user mr-2"></i>
              Admin Panel
            </div>
            
            {/* Mobile Admin Indicator */}
            <div className="sm:hidden">
              <i className="fas fa-user text-gray-500"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}