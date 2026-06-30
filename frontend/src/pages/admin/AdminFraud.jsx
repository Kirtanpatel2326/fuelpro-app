import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Ban, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const flagsOverTime = Array.from({length: 30}).map((_, i) => ({
  date: `06-${String(i+1).padStart(2, '0')}`,
  flags: Math.floor(Math.random() * 5)
}));

const flaggedAccounts = [
  { id: '1', name: 'James Smith', email: 'james.smith@example.com', reason: 'Multiple devices within 24h', severity: 'High', status: 'Pending Review', date: '2026-06-27' },
  { id: '2', name: 'Maria Garcia', email: 'maria.g@example.com', reason: 'Unusually high point redemption', severity: 'Medium', status: 'Pending Review', date: '2026-06-26' },
  { id: '3', name: 'David Lee', email: 'davidlee88@example.com', reason: 'Frequent IP changes', severity: 'Low', status: 'Under Investigation', date: '2026-06-25' },
  { id: '4', name: 'Sarah Connor', email: 'sarah.c@example.com', reason: 'Multiple failed login attempts', severity: 'High', status: 'Suspended', date: '2026-06-24' },
];

export default function AdminFraud() {
  const [searchTerm, setSearchTerm] = useState('');

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending Review': return 'text-yellow-600 bg-yellow-50';
      case 'Under Investigation': return 'text-blue-600 bg-blue-50';
      case 'Suspended': return 'text-red-600 bg-red-50';
      case 'Resolved': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stats & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center text-red-500 mb-4">
              <ShieldAlert className="w-8 h-8 mr-3" />
              <h2 className="text-xl font-bold text-fp-navy">System Alert Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="font-bold text-red-800">Critical Flags</span>
                <span className="text-xl font-bold text-red-600">4</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <span className="font-bold text-orange-800">Accounts Suspended</span>
                <span className="text-xl font-bold text-orange-600">12</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <span className="font-bold text-green-800">False Positives (30d)</span>
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2.5 bg-fp-navy text-white rounded-lg font-bold hover:bg-[#2A3F54] transition-colors flex items-center justify-center">
              <Lock className="w-4 h-4 mr-2" />
              Review Security Policies
            </button>
          </div>
        </div>

        {/* Flags Over Time Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Flags Over Time (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flagsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} minTickGap={30} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="stepAfter" dataKey="flags" stroke="#E8132A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Flagged Accounts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold text-fp-navy">Flagged Accounts</h3>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fp-navy transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flaggedAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{account.name}</div>
                    <div className="text-sm text-gray-500">{account.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor(account.severity)}`}>
                      {account.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(account.status)}`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {account.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Resolve">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Suspend Account">
                        <Ban className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-fp-navy hover:bg-gray-100 rounded transition-colors" title="View Details">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
