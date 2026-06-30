import React, { useState } from 'react';
import { Store, Award, Users, Handshake, CreditCard, Save } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Station Profile', icon: Store },
    { id: 'points', label: 'Points Config', icon: Award },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'partners', label: 'Partners & Integration', icon: Handshake },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      
      {/* Secondary Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-xl font-bold text-fp-navy mb-6">Settings</h2>
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-fp-navy text-white shadow-md shadow-blue-900/20' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-300' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px]">
        
        {activeTab === 'profile' && (
          <div className="space-y-8 max-w-2xl">
            <div>
              <h3 className="text-2xl font-bold text-fp-navy mb-2">Station Profile</h3>
              <p className="text-gray-500 text-sm">Manage your station's public details and branding.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Station Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fp-navy focus:border-fp-navy" defaultValue="FuelPro Downtown" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fp-navy focus:border-fp-navy" defaultValue="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fp-navy focus:border-fp-navy" defaultValue="downtown@fuelpro.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Address</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fp-navy focus:border-fp-navy mb-3" defaultValue="123 Main Street" />
                <div className="grid grid-cols-3 gap-5">
                  <input type="text" className="col-span-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fp-navy focus:border-fp-navy" defaultValue="Anytown" />
                  <input type="text" className="col-span-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fp-navy focus:border-fp-navy" defaultValue="CA" />
                  <input type="text" className="col-span-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fp-navy focus:border-fp-navy" defaultValue="90210" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button className="flex items-center px-6 py-2.5 bg-fp-navy text-white rounded-lg font-bold hover:bg-[#2A3F54] transition-colors">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h3 className="text-2xl font-bold text-fp-navy mb-2">Points Configuration</h3>
              <p className="text-gray-500 text-sm">Define how customers earn points and tier thresholds.</p>
            </div>
            
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-fp-gold" />
                Earning Rules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Per Gallon (Regular)</span>
                  <div className="flex items-center">
                    <input type="number" defaultValue="10" className="w-16 text-right px-2 py-1 border rounded mr-2" />
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Per Gallon (Premium)</span>
                  <div className="flex items-center">
                    <input type="number" defaultValue="20" className="w-16 text-right px-2 py-1 border rounded mr-2" />
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Per $1 In-Store</span>
                  <div className="flex items-center">
                    <input type="number" defaultValue="5" className="w-16 text-right px-2 py-1 border rounded mr-2" />
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Account Creation</span>
                  <div className="flex items-center">
                    <input type="number" defaultValue="500" className="w-16 text-right px-2 py-1 border rounded mr-2" />
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-sm font-bold text-gray-700">Tier Name</th>
                    <th className="px-4 py-3 text-sm font-bold text-gray-700">Points Threshold</th>
                    <th className="px-4 py-3 text-sm font-bold text-gray-700">Bonus Multiplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-[#CD7F32]">Bronze</td>
                    <td className="px-4 py-3"><input type="number" defaultValue="0" className="w-24 px-2 py-1 border rounded text-sm" /></td>
                    <td className="px-4 py-3"><input type="number" defaultValue="1.0" step="0.1" className="w-20 px-2 py-1 border rounded text-sm" />x</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-[#C0C0C0]">Silver</td>
                    <td className="px-4 py-3"><input type="number" defaultValue="1000" className="w-24 px-2 py-1 border rounded text-sm" /></td>
                    <td className="px-4 py-3"><input type="number" defaultValue="1.2" step="0.1" className="w-20 px-2 py-1 border rounded text-sm" />x</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-[#FFD700]">Gold</td>
                    <td className="px-4 py-3"><input type="number" defaultValue="5000" className="w-24 px-2 py-1 border rounded text-sm" /></td>
                    <td className="px-4 py-3"><input type="number" defaultValue="1.5" step="0.1" className="w-20 px-2 py-1 border rounded text-sm" />x</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-[#6B7280]">Platinum</td>
                    <td className="px-4 py-3"><input type="number" defaultValue="15000" className="w-24 px-2 py-1 border rounded text-sm" /></td>
                    <td className="px-4 py-3"><input type="number" defaultValue="2.0" step="0.1" className="w-20 px-2 py-1 border rounded text-sm" />x</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button className="flex items-center px-6 py-2.5 bg-fp-navy text-white rounded-lg font-bold hover:bg-[#2A3F54] transition-colors">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Placeholder content for other tabs */}
        {(activeTab === 'staff' || activeTab === 'partners' || activeTab === 'billing') && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
              {activeTab === 'staff' && <Users className="w-8 h-8" />}
              {activeTab === 'partners' && <Handshake className="w-8 h-8" />}
              {activeTab === 'billing' && <CreditCard className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 capitalize">{activeTab} Settings</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">
                This section is under construction. Settings for {activeTab} will be available in the next release.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
