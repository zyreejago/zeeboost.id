import React from 'react';

interface HeaderProps {
  activeTab: string;
}

export default function Header({ activeTab }: HeaderProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'transactions', name: 'Transaksi' },
    { id: 'stock', name: 'Stock Robux' },
    { id: 'banners', name: 'Banner' },
    { id: 'news', name: 'News' },
    { id: 'discounts', name: 'Discount' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {menuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
          </h2>
          <div className="text-sm text-gray-500">
            <i className="fas fa-user mr-2"></i>
            Admin Panel
          </div>
        </div>
      </div>
    </header>
  );
}