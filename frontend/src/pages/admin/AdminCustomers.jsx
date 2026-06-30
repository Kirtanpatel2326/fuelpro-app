import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, ShieldAlert, BadgeCheck } from 'lucide-react';
import { api, formatApiErrorDetail } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/customers');
      if (res.data?.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tierName) => {
    switch(tierName?.toLowerCase()) {
      case 'bronze': return 'bg-[#CD7F32] text-white';
      case 'silver': return 'bg-[#C0C0C0] text-gray-800';
      case 'gold': return 'bg-[#FFD700] text-gray-900';
      case 'platinum': return 'bg-[#E5E4E2] text-gray-900';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search customers by name or email..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fp-navy transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
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
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 animate-pulse font-medium">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-fp-navy text-white flex items-center justify-center font-bold text-sm mr-4">
                        {(customer.name || 'U').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getTierColor(customer.tier?.name || 'Standard')}`}>
                      {customer.tier?.name || 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-fp-navy">{(customer.points || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {customer.visits || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {customer.flags && customer.flags > 0 ? (
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
          <div>Showing <span className="font-medium text-gray-900">{filteredCustomers.length}</span> customers</div>
        </div>
      </div>

    </div>
  );
}
