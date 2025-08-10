import React, { useMemo } from 'react';
import { Transaction, News, RobuxStock } from '@/types/admin';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  news: News[];
  robuxStock?: RobuxStock[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, news, robuxStock = [] }) => {
  // Hitung statistik
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;
    
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.finalPrice || t.totalPrice), 0);
    
    const totalRobux = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.robuxAmount, 0);
    
    return {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalRevenue,
      totalRobux,
      successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions * 100).toFixed(1) : '0'
    };
  }, [transactions]);

  // Data untuk chart transaksi harian (7 hari terakhir)
  const dailyTransactions = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => 
        t.createdAt.split('T')[0] === date
      );
      
      const completed = dayTransactions.filter(t => t.status === 'completed').length;
      const pending = dayTransactions.filter(t => t.status === 'pending').length;
      const failed = dayTransactions.filter(t => t.status === 'failed').length;
      
      return {
        date: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        completed,
        pending,
        failed,
        total: completed + pending + failed
      };
    });
  }, [transactions]);

  // Data untuk pie chart status transaksi
  const statusData = [
    { name: 'Selesai', value: stats.completedTransactions, color: '#10b981' },
    { name: 'Pending', value: stats.pendingTransactions, color: '#f59e0b' },
    { name: 'Gagal', value: stats.failedTransactions, color: '#ef4444' }
  ];

  // Data untuk revenue chart
  const revenueData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayRevenue = transactions
        .filter(t => t.createdAt.split('T')[0] === date && t.status === 'completed')
        .reduce((sum, t) => sum + (t.finalPrice || t.totalPrice), 0);
      
      return {
        date: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        revenue: dayRevenue
      };
    });
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-credit-card text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Transaksi</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              <p className="text-xs text-green-600 mt-1">
                <i className="fas fa-arrow-up mr-1"></i>
                Success Rate: {stats.successRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Transaksi Sukses</h3>
              <p className="text-2xl font-bold text-green-600">{stats.completedTransactions}</p>
              <p className="text-xs text-gray-500 mt-1">
                Pending: {stats.pendingTransactions} | Gagal: {stats.failedTransactions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-coins text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-bold text-purple-600">
                Rp {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalRobux.toLocaleString()} Robux terjual
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-newspaper text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total News</h3>
              <p className="text-2xl font-bold text-orange-600">{news.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                Stock Variants: {robuxStock.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <i className="fas fa-chart-line mr-2 text-purple-600"></i>
              Revenue 7 Hari Terakhir
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Status Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <i className="fas fa-chart-pie mr-2 text-blue-600"></i>
              Status Transaksi
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Transactions Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <i className="fas fa-chart-bar mr-2 text-green-600"></i>
            Transaksi Harian (7 Hari Terakhir)
          </h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTransactions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Selesai" />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
              <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Gagal" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <i className="fas fa-clock mr-2 text-indigo-600"></i>
            Aktivitas Terbaru
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction, index) => (
              <div key={transaction.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.status === 'completed' ? 'bg-green-100 text-green-600' :
                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <i className={`fas ${
                    transaction.status === 'completed' ? 'fa-check' :
                    transaction.status === 'pending' ? 'fa-clock' :
                    'fa-times'
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.user.robloxUsername}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.robuxAmount.toLocaleString()} Robux - Rp {transaction.totalPrice.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status === 'completed' ? 'Selesai' :
                     transaction.status === 'pending' ? 'Pending' : 'Gagal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};