import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

const customerGrowth = Array.from({length: 30}).map((_, i) => ({
  date: `06-${String(i+1).padStart(2, '0')}`,
  value: Math.random() > 0.5 ? Math.random() * 0.5 + 0.5 : 0
}));

const weeklyRedemptions = [
  { name: '06-21', value: 4.8 },
  { name: '06-22', value: 5.2 },
  { name: '06-23', value: 5.0 },
  { name: '06-24', value: 4.2 },
  { name: '06-25', value: 5.5 },
  { name: '06-26', value: 4.8 },
  { name: '06-27', value: 2.1 },
];

const tierDistribution = [
  { name: 'Bronze', value: 45, color: '#CD7F32' },
  { name: 'Gold', value: 20, color: '#FFD700' },
  { name: 'Platinum', value: 5, color: '#E5E4E2' },
  { name: 'Silver', value: 30, color: '#C0C0C0' },
];

const topCoupons = [
  { name: '5% Cashback on Premium Fuel', redemptions: 35 },
  { name: 'Free Coffee with Fill-up', redemptions: 34 },
  { name: '20% Off Snacks', redemptions: 26 },
  { name: '$5 Off Car Wash', redemptions: 25 },
  { name: '$10 Off Diesel Fill-up', redemptions: 25 },
  { name: 'BOGO Energy Drinks', redemptions: 23 },
  { name: 'Free Donut Tuesday', redemptions: 21 },
];

export default function AdminAnalytics() {
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
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} domain={[0, 1]} />
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
                  <span style={{color: tier.color}}>{tier.name}</span>
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
                      width: `${(coupon.redemptions / topCoupons[0].redemptions) * 100}%`,
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
            <p className="text-3xl font-bold text-fp-navy">80</p>
          </div>
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active 7D</p>
            <p className="text-3xl font-bold text-green-500">63</p>
          </div>
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Redemptions</p>
            <p className="text-3xl font-bold text-fp-red">251</p>
          </div>
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Points Issued</p>
            <p className="text-3xl font-bold text-fp-gold">302,862</p>
          </div>
          
          <div className="px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-3xl font-bold text-fp-navy">$30,312</p>
          </div>

        </div>
      </div>

    </div>
  );
}
