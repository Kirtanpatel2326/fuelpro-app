import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, Clock, X } from 'lucide-react';
import { api } from '@/lib/api';

const coupons = [
  { id: '1', title: '5% Cashback on Premium Fuel', type: 'CASHBACK', discount: '5%', used: 1250, limit: null, status: 'Active', expiry: '2026-12-31', stores: 'All Stores' },
  { id: '2', title: 'Free Coffee with Fill-up', type: 'FREE_ITEM', discount: '$3.50', used: 840, limit: 1000, status: 'Active', expiry: '2026-07-15', stores: 'Downtown & Westside' },
  { id: '3', title: '20% Off Snacks', type: 'PERCENT_OFF', discount: '20%', used: 320, limit: 500, status: 'Active', expiry: '2026-08-01', stores: 'All Stores' },
  { id: '4', title: '$5 Off Car Wash', type: 'FIXED_AMOUNT', discount: '$5.00', used: 415, limit: null, status: 'Active', expiry: '2026-09-30', stores: 'Downtown Only' },
  { id: '5', title: '$10 Off Diesel Fill-up', type: 'FIXED_AMOUNT', discount: '$10.00', used: 150, limit: 200, status: 'Expiring Soon', expiry: '2026-06-30', stores: 'Highway 99' },
  { id: '6', title: 'BOGO Energy Drinks', type: 'BOGO', discount: '50%', used: 500, limit: 500, status: 'Depleted', expiry: '2026-06-25', stores: 'All Stores' },
];

export default function AdminCoupons() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New coupon form state
  const [newCoupon, setNewCoupon] = useState({
    title: '',
    description: 'Special offer for you!',
    type: 'FIXED_AMOUNT',
    discount_type: 'FIXED',
    discount_value: 5,
    starts_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    valid_location_ids: [], // empty = all
  });
  
  const fetchCoupons = () => {
    api.get('/admin/coupons').then(res => {
      setCoupons(res.data.data.length ? res.data.data : coupons);
      setLoading(false);
    }).catch(() => {
      setCoupons(coupons); // fallback to mock data
      setLoading(false);
    });
  };

  useEffect(() => {
    api.get('/locations').then(res => setLocations(res.data.data)).catch(() => {});
    fetchCoupons();
    const openAdd = () => setShowModal(true);
    window.addEventListener('open-create-coupon', openAdd);
    return () => window.removeEventListener('open-create-coupon', openAdd);
  }, []);

  const handleCreateCoupon = async () => {
    try {
      await api.post('/admin/coupons', newCoupon);
      toast.success('Coupon created successfully');
      setShowModal(false);
      setNewCoupon({
        ...newCoupon,
        title: '',
        discount_value: 5,
      });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create coupon');
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'CASHBACK': return 'bg-green-100 text-green-700 border-green-200';
      case 'FREE_ITEM': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PERCENT_OFF': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'FIXED_AMOUNT': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'BOGO': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
            placeholder="Search coupons..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fp-navy transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            All Types
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            All Statuses
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-fp-navy text-white rounded-lg text-sm font-medium hover:bg-[#2A3F54] transition-colors ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Coupon
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Loading coupons...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Used / Limit</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Applicable Stores</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{coupon.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getTypeColor(coupon.type)}`}>
                        {coupon.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-fp-navy">{coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `$${coupon.discount_value.toFixed(2)}`}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-600">
                        <span>{coupon.used_count || 0}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-gray-400">{coupon.max_uses ? coupon.max_uses.toLocaleString() : '∞'}</span>
                      </div>
                      {coupon.max_uses && (
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${(coupon.used_count || 0) >= coupon.max_uses ? 'bg-red-500' : 'bg-fp-navy'}`} 
                            style={{width: `${Math.min(((coupon.used_count || 0) / coupon.max_uses) * 100, 100)}%`}}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {!coupon.valid_location_ids || coupon.valid_location_ids.length === 0 ? (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">All Stores</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">{coupon.valid_location_ids.length} Stores</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${coupon.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                        {new Date(coupon.expires_at).toLocaleDateString()}
                      </div>
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
        )}
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Showing <span className="font-medium text-gray-900">{coupons.length > 0 ? 1 : 0}</span> to <span className="font-medium text-gray-900">{coupons.length}</span> of <span className="font-medium text-gray-900">{coupons.length}</span> coupons</div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md bg-fp-navy text-white font-medium">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* New Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-fade-in-up">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Coupon</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Coupon Title</label>
                <input 
                  type="text" 
                  value={newCoupon.title}
                  onChange={e => setNewCoupon({...newCoupon, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fp-navy outline-none" 
                  placeholder="e.g. Free Coffee" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select 
                    value={newCoupon.discount_type}
                    onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fp-navy outline-none"
                  >
                    <option value="FIXED">Fixed Amount ($)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Value</label>
                  <input 
                    type="number" 
                    value={newCoupon.discount_value}
                    onChange={e => setNewCoupon({...newCoupon, discount_value: parseFloat(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fp-navy outline-none" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Applicable Locations</label>
                <select 
                  multiple 
                  value={newCoupon.valid_location_ids}
                  onChange={e => {
                    const vals = Array.from(e.target.selectedOptions, option => option.value);
                    if (vals.includes('ALL')) {
                      setNewCoupon({...newCoupon, valid_location_ids: []});
                    } else {
                      setNewCoupon({...newCoupon, valid_location_ids: vals});
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-fp-navy outline-none h-32"
                >
                  <option value="ALL" className="font-bold">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Cmd/Ctrl to select multiple. Select "All Locations" for chain-wide.</p>
              </div>

              <button 
                onClick={handleCreateCoupon}
                className="w-full bg-fp-navy text-white font-bold rounded-lg py-3 hover:bg-[#2A3F54] transition-colors mt-4"
                disabled={!newCoupon.title}
              >
                Create Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
