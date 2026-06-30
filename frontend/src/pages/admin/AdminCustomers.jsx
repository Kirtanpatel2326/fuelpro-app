import React, { useState } from 'react';
import { Search, Filter, Download, MoreVertical, ShieldAlert, BadgeCheck } from 'lucide-react';

const customers = [
  { id: '1', name: 'Alex Rivers', email: 'alex@fuelpro.com', tier: 'Gold', points: 6420, visits: 24, joined: '2025-11-10', flags: 0 },
  { id: '2', name: 'Mason Iyer', email: 'mason@example.com', tier: 'Bronze', points: 150, visits: 2, joined: '2026-06-25', flags: 1 },
  { id: '3', name: 'Olivia Anderson', email: 'olivia@example.com', tier: 'Silver', points: 1250, visits: 8, joined: '2026-04-12', flags: 0 },
  { id: '4', name: 'Ava Davis', email: 'ava@example.com', tier: 'Platinum', points: 18450, visits: 85, joined: '2024-02-14', flags: 0 },
  { id: '5', name: 'Noah Reddy', email: 'noah@example.com', tier: 'Bronze', points: 420, visits: 3, joined: '2026-05-20', flags: 2 },
  { id: '6', name: 'Emma Wilson', email: 'emma@example.com', tier: 'Silver', points: 3100, visits: 15, joined: '2025-08-30', flags: 0 },
];

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Bronze': return 'bg-[#CD7F32] text-white';
      case 'Silver': return 'bg-[#C0C0C0] text-gray-800';
      case 'Gold': return 'bg-[#FFD700] text-gray-900';
      case 'Platinum': return 'bg-[#E5E4E2] text-gray-900';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search customers by name, email, or phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fp-navy transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            All Tiers
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Most Points
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-auto sm:ml-0">
            <Download className="w-4 h-4 mr-2 text-gray-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Visits</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Flags</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-fp-navy text-white flex items-center justify-center font-bold text-sm mr-4">
                        {customer.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getTierColor(customer.tier)}`}>
                      {customer.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-fp-navy">{customer.points.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {customer.visits}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {customer.joined}
                  </td>
                  <td className="px-6 py-4">
                    {customer.flags > 0 ? (
                      <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded w-fit">
                        <ShieldAlert className="w-4 h-4 mr-1" />
                        <span className="text-xs font-bold">{customer.flags}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-500">
                        <BadgeCheck className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-fp-navy opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">6</span> of <span className="font-medium text-gray-900">4,289</span> customers</div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md bg-fp-navy text-white font-medium">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
