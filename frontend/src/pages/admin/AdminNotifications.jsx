import React from 'react';
import { Bell, Search, Filter, CheckCircle, Clock } from 'lucide-react';

const notifications = [
  { id: 1, title: 'New Customer Registered', message: 'Alex Rivers just created an account.', time: '2 mins ago', read: false, type: 'user' },
  { id: 2, title: 'Fraud Alert', message: 'Suspicious activity detected on account ID #4829.', time: '15 mins ago', read: false, type: 'alert' },
  { id: 3, title: 'Weekly Report Ready', message: 'Your weekly performance report is available.', time: '1 hour ago', read: false, type: 'system' },
  { id: 4, title: 'Coupon Depleted', message: '"BOGO Energy Drinks" has reached its limit of 500 redemptions.', time: '3 hours ago', read: true, type: 'coupon' },
  { id: 5, title: 'System Maintenance', message: 'Scheduled maintenance will occur on Sunday at 2 AM EST.', time: '1 day ago', read: true, type: 'system' },
];

export default function AdminNotifications() {
  const getTypeColor = (type) => {
    switch(type) {
      case 'alert': return 'bg-red-100 text-red-600';
      case 'user': return 'bg-green-100 text-green-600';
      case 'coupon': return 'bg-orange-100 text-orange-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-fp-navy">Notifications</h2>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fp-navy transition-all text-sm"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-fp-navy hover:bg-gray-50 transition-colors">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {notifications.map((notif) => (
          <div key={notif.id} className={`p-6 flex gap-4 transition-colors hover:bg-gray-50/50 ${!notif.read ? 'bg-blue-50/10' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notif.type)}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-sm font-bold ${!notif.read ? 'text-fp-navy' : 'text-gray-900'}`}>
                  {notif.title}
                </h4>
                <div className="flex items-center text-xs text-gray-500 font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {notif.time}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{notif.message}</p>
              {!notif.read && (
                <div className="flex items-center space-x-3">
                  <button className="text-xs font-bold text-fp-navy hover:text-[#2A3F54] transition-colors">Mark as read</button>
                  <button className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors">View details</button>
                </div>
              )}
            </div>
            {!notif.read && (
              <div className="w-2 h-2 rounded-full bg-fp-navy mt-1.5 flex-shrink-0"></div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
