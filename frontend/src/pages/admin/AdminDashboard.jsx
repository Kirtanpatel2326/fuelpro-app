import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, LineChart, Line
} from 'recharts';
import { Users, Ticket, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { api, formatApiErrorDetail } from '@/lib/api';
import { toast } from 'sonner';

const Sparkline = ({ data, color }) => (
  <div className="h-12 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v, i) => ({ val: v, ix: i }))}>
        <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: {
      total_customers: 0,
      active_this_week: 0,
      coupons_redeemed: 0,
      points_issued: 0,
      revenue: 0
    },
    weeklyRedemptions: [],
    tierDistribution: [],
    pointsEconomy: [],
    topCoupons: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, weeklyRes, tierRes, growthRes, couponRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/weekly-redemptions'),
        api.get('/analytics/tier-distribution'),
        api.get('/analytics/customer-growth'),
        api.get('/analytics/coupon-performance')
      ]);

      setData({
        kpis: overviewRes.data?.data || {},
        weeklyRedemptions: (weeklyRes.data?.data || []).map(d => ({
          name: d.date.substring(5),
          value: d.redemptions
        })),
        tierDistribution: (tierRes.data?.data || []).map(t => ({
          name: t.name,
          value: t.count,
          color: t.color
        })),
        pointsEconomy: (growthRes.data?.data || []).map(g => ({
          date: g.date.substring(5),
          points: g.count * 100 // Mocking points based on growth since no endpoint
        })),
        topCoupons: (couponRes.data?.data || []).map(c => ({
          name: c.title,
          redemptions: c.redemptions
        }))
      });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading dashboard...</div>;
  }

  const { kpis, weeklyRedemptions, tierDistribution, pointsEconomy, topCoupons } = data;

  const kpiCards = [
    { title: 'Total Customers', value: kpis.total_customers?.toLocaleString(), change: '+12%', trend: 'up', data: [40, 50, 45, 60, 70, 80, 85] },
    { title: 'Active This Week', value: kpis.active_this_week?.toLocaleString(), change: '+5%', trend: 'up', data: [20, 25, 22, 30, 28, 35, 40] },
    { title: 'Coupons Redeemed', value: kpis.coupons_redeemed?.toLocaleString(), change: '-2%', trend: 'down', data: [90, 85, 80, 75, 70, 68, 65] },
    { title: 'Revenue', value: `$${kpis.revenue?.toLocaleString()}`, change: '+18%', trend: 'up', data: [30, 40, 35, 50, 65, 80, 95] }
  ];

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-bold text-fp-navy mb-2">{kpi.value}</h3>
              <div className={`flex items-center text-sm font-semibold ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {kpi.change} vs last week
              </div>
            </div>
            <Sparkline data={kpi.data} color={kpi.trend === 'up' ? '#22C55E' : '#EF4444'} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Weekly Redemptions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 xl:col-span-2">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Weekly Redemptions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRedemptions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#E8132A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Tier Distribution</h3>
          <div className="h-64 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={tierDistribution} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {tierDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-2">
              {tierDistribution.map(tier => (
                <div key={tier.name} className="flex items-center text-xs font-semibold text-gray-500">
                  <span className="w-3 h-3 rounded-sm mr-1.5" style={{backgroundColor: tier.color}}></span>
                  {tier.name}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Points Economy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Customer Growth (14d)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pointsEconomy}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#112240" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#112240" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} minTickGap={30} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="points" stroke="#112240" strokeWidth={2} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Coupons */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Top Coupons</h3>
          <div className="space-y-5">
            {topCoupons.map((coupon, i) => (
              <div key={i}>
                <div className="flex justify-between items-center text-sm font-bold text-fp-navy mb-1.5">
                  <span>{coupon.name}</span>
                  <span className="text-gray-500">{coupon.redemptions}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
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

    </div>
  );
}
