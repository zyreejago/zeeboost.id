import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen 
}: SidebarProps) {
  const router = useRouter();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen, sidebarOpen]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after selecting menu
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'transactions', name: 'Transaksi', icon: 'fas fa-credit-card' },
    { id: 'reports', name: 'Laporan', icon: 'fas fa-chart-bar' },
    { id: 'stock', name: 'Stock Robux', icon: 'fas fa-coins' },
    { id: 'robux-themes', name: 'Robux Vilog', icon: 'fas fa-gamepad' },
    { id: 'banners', name: 'Banner', icon: 'fas fa-image' },
    { id: 'news', name: 'News', icon: 'fas fa-newspaper' },
    { id: 'discounts', name: 'Discount', icon: 'fas fa-tags' },
    { id: 'reviews', name: 'Review', icon: 'fas fa-star' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebarOpen ? 'w-64' : 'w-64 md:w-16'} 
        bg-white shadow-lg md:shadow-lg flex flex-col
        h-full md:h-auto
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${!sidebarOpen && 'md:justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-sm"></i>
              </div>
              {(sidebarOpen || window.innerWidth < 768) && (
                <h1 className="ml-3 text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  ZeeBoost Admin
                </h1>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors md:block hidden"
            >
              <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-gray-500`}></i>
            </button>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              <i className="fas fa-times text-gray-500"></i>
            </button>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center px-3 py-3 md:py-2 rounded-lg transition-all text-left ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={(!sidebarOpen && window.innerWidth >= 768) ? item.name : ''}
                >
                  <i className={`${item.icon} ${
                    (sidebarOpen || window.innerWidth < 768) ? 'mr-3' : 'mx-auto'
                  } text-sm`}></i>
                  {(sidebarOpen || window.innerWidth < 768) && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-3 md:py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all ${
              (!sidebarOpen && window.innerWidth >= 768) ? 'justify-center' : ''
            }`}
            title={(!sidebarOpen && window.innerWidth >= 768) ? 'Logout' : ''}
          >
            <i className={`fas fa-sign-out-alt ${
              (sidebarOpen || window.innerWidth < 768) ? 'mr-3' : ''
            } text-sm`}></i>
            {(sidebarOpen || window.innerWidth < 768) && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}