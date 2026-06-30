import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, LineChart, Line
} from 'recharts';
import { Users, Ticket, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const KPIData = [
  { title: 'Total Customers', value: '4,289', change: '+12%', trend: 'up', data: [40, 50, 45, 60, 70, 80, 85] },
  { title: 'Active This Week', value: '1,842', change: '+5%', trend: 'up', data: [20, 25, 22, 30, 28, 35, 40] },
  { title: 'Coupons Redeemed', value: '8,392', change: '-2%', trend: 'down', data: [90, 85, 80, 75, 70, 68, 65] },
  { title: 'Revenue Boost Est.', value: '$12,450', change: '+18%', trend: 'up', data: [30, 40, 35, 50, 65, 80, 95] }
];

const weeklyRedemptions = [
  { name: '06-21', value: 3.5 },
  { name: '06-22', value: 4.2 },
  { name: '06-23', value: 4.8 },
  { name: '06-24', value: 3.2 },
  { name: '06-25', value: 5.1 },
  { name: '06-26', value: 4.5 },
  { name: '06-27', value: 2.1 },
];

const tierDistribution = [
  { name: 'Bronze', value: 45, color: '#CD7F32' },
  { name: 'Silver', value: 30, color: '#C0C0C0' },
  { name: 'Gold', value: 20, color: '#FFD700' },
  { name: 'Platinum', value: 5, color: '#E5E4E2' },
];

const pointsEconomy = Array.from({length: 30}).map((_, i) => ({
  date: `06-${String(i+1).padStart(2, '0')}`,
  points: Math.floor(Math.random() * 8000) + 6000
}));

const recentActivity = [
  { user: 'Alex Rivers', avatar: 'AR', action: 'joined FuelPro Rewards', time: '1h ago', type: 'JOINED' },
  { user: 'Mason Iyer', avatar: 'MI', action: 'made a $55.53 store purchase', time: '2h ago', type: 'EARNED' },
  { user: 'Olivia Anderson', avatar: 'OA', action: 'made a $40.40 carwash purchase', time: '2h ago', type: 'EARNED' },
  { user: 'Ava Davis', avatar: 'AD', action: 'made a $48.70 fuel purchase', time: '2h ago', type: 'EARNED' },
];

const topCoupons = [
  { name: '5% Cashback on Premium Fuel', redemptions: 35 },
  { name: 'Free Coffee with Fill-up', redemptions: 34 },
  { name: '20% Off Snacks', redemptions: 26 },
  { name: '$5 Off Car Wash', redemptions: 25 },
  { name: '$10 Off Diesel Fill-up', redemptions: 25 },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({length: 24}).map((_, i) => i);
const heatmapData = days.map(day => 
  hours.map(hour => Math.floor(Math.random() * 10))
);

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
  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {KPIData.map((kpi, i) => (
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Points Economy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 xl:col-span-2">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Points Economy (30d)</h3>
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

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-fp-navy">Recent Activity</h3>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0">
                  {activity.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-snug">
                    <span className="font-bold text-fp-navy mr-1">{activity.user}</span> 
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
                <div className="ml-2">
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase">
                    {activity.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Visit Heatmap */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-fp-navy mb-6">Visit Heatmap (last 7 days)</h3>
          <div className="flex text-xs text-gray-400 mb-2">
            <div className="w-8"></div>
            <div className="flex-1 flex justify-between px-2">
              <span>0h</span><span>6h</span><span>12h</span><span>18h</span>
            </div>
          </div>
          <div className="space-y-1">
            {days.map((day, dIdx) => (
              <div key={day} className="flex items-center">
                <div className="w-8 text-xs font-medium text-gray-500">{day}</div>
                <div className="flex-1 flex gap-1">
                  {heatmapData[dIdx].map((val, hIdx) => {
                    const intensity = val === 0 ? 'bg-gray-50' : 
                                      val < 3 ? 'bg-red-200' : 
                                      val < 6 ? 'bg-red-400' : 
                                      val < 8 ? 'bg-red-500' : 'bg-red-600';
                    return <div key={hIdx} className={`flex-1 h-4 rounded-sm ${intensity} hover:ring-2 hover:ring-fp-navy transition-all cursor-pointer`} title={`${day} ${hIdx}:00 - ${val} visits`}></div>;
                  })}
                </div>
              </div>
            ))}
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

    </div>
  );
}
