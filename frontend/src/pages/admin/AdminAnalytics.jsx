import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { api, formatApiErrorDetail } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    customerGrowth: [],
    weeklyRedemptions: [],
    tierDistribution: [],
    topCoupons: [],
    kpis: {
      total_customers: 0,
      active_this_week: 0,
      total_redemptions: 0,
      points_issued: 0,
      estimated_revenue: 0
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [growthRes, weeklyRes, tierRes, couponRes, overviewRes] = await Promise.all([
        api.get('/analytics/customer-growth'),
        api.get('/analytics/weekly-redemptions'),
        api.get('/analytics/tier-distribution'),
        api.get('/analytics/coupon-performance'),
        api.get('/analytics/overview')
      ]);

      setData({
        customerGrowth: growthRes.data?.data || [],
        weeklyRedemptions: weeklyRes.data?.data || [],
        tierDistribution: tierRes.data?.data || [],
        topCoupons: (couponRes.data?.data || []).map(c => ({
          name: c.title,
          redemptions: c.redemptions
        })),
        kpis: overviewRes.data?.data || {
          total_customers: 0,
          active_this_week: 0,
          total_redemptions: 0,
          points_issued: 0,
          estimated_revenue: 0
        }
      });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading analytics...</div>;
  }

  const { customerGrowth, weeklyRedemptions, tierDistribution, topCoupons, kpis } = data;

  return (
    <div className="space-y-6">
      
      {/* Top Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Customer Growth */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Customer Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} minTickGap={30} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} domain={['auto', 'auto']} />
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="value" stroke="#F5A623" strokeWidth={2} dot={{r: 3, fill: '#F5A623', strokeWidth: 1, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Redemptions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Weekly Redemptions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRedemptions}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#E8132A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Middle Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Tier Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Tier Distribution</h3>
          <div className="h-72 flex flex-col items-center justify-center border-2 border-fp-navy rounded-lg">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={tierDistribution} innerRadius={0} outerRadius={100} dataKey="value" stroke="#fff" strokeWidth={2}>
                  {tierDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {tierDistribution.map(tier => (
                <div key={tier.name} className="flex items-center text-sm font-bold text-gray-400">
                  <span className="w-3 h-3 rounded-sm mr-2" style={{backgroundColor: tier.color}}></span>
                  <span style={{color: tier.color}}>{tier.name} ({tier.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Coupons by Redemption */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Top Coupons by Redemption</h3>
          <div className="space-y-4">
            {topCoupons.map((coupon, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-sm font-bold text-fp-navy mb-1.5">
                  <span>{coupon.name}</span>
                  <span className="text-gray-500">{coupon.redemptions}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5">
                  <div 
                    className="h-2.5" 
                    style={{
                      width: topCoupons.length > 0 ? `${(coupon.redemptions / topCoupons[0].redemptions) * 100}%` : '0%',
                      background: 'linear-gradient(90deg, #E8132A 0%, #F5A623 100%)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* KPI Snapshot */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-fp-navy mb-6">KPI Snapshot</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-x divide-gray-100">
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Customers</p>
            <p className="text-3xl font-bold text-fp-navy">{kpis.total_customers.toLocaleString()}</p>
          </div>
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active 7D</p>
            <p className="text-3xl font-bold text-green-500">{kpis.active_this_week.toLocaleString()}</p>
          </div>
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Redemptions</p>
            <p className="text-3xl font-bold text-fp-red">{kpis.total_redemptions.toLocaleString()}</p>
          </div>
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Points Issued</p>
            <p className="text-3xl font-bold text-fp-gold">{kpis.points_issued.toLocaleString()}</p>
          </div>
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-3xl font-bold text-fp-navy">${kpis.estimated_revenue.toLocaleString()}</p>
          </div>

        </div>
      </div>

    </div>
  );
}
